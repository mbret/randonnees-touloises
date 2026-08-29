import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { beforeAll, describe, expect, it } from 'vitest'

import type { Media as MediaDoc } from '@/payload-types'

import { Media } from '@/collections/Media'
import { getImageURL } from '@/seo/imageUrl'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { MEDIA_CACHE_TAG_PARAM, withMediaCacheControl } from '@/utilities/mediaCacheTag'

beforeAll(() => {
  process.env.NEXT_PUBLIC_SERVER_URL = 'https://abonnes.randonnees-touloises.net'
})

const REVISION = '2026-01-01T00:00:00.000Z'

/** An upload as the frontend receives it, with an `og` size generated. */
const upload = (overrides: Partial<MediaDoc> = {}) =>
  ({
    createdAt: REVISION,
    id: 1,
    updatedAt: REVISION,
    url: '/api/media/file/photo.webp',
    ...overrides,
  }) as MediaDoc

/** The `Cache-Control` the media file route answers with. */
const mediaCacheControl = (): string | null => {
  const headers = new Headers()

  return (Media.upload as { modifyResponseHeaders: (args: { headers: Headers }) => Headers })
    .modifyResponseHeaders({ headers })
    .get('Cache-Control')
}

/** The seconds a `Cache-Control` directive is asking for. */
const seconds = (cacheControl: string | null, directive: string): number => {
  const match = cacheControl?.match(new RegExp(`${directive}=(\\d+)`))

  return match ? Number(match[1]) : 0
}

const DAY = 60 * 60 * 24

describe('media file caching', () => {
  it('lets a client keep an upload rather than revalidate it on every page view', () => {
    const cacheControl = mediaCacheControl()

    expect(cacheControl).toContain('public')
    expect(cacheControl).not.toMatch(/max-age=0|no-store|must-revalidate/)
    expect(seconds(cacheControl, 'max-age')).toBeGreaterThanOrEqual(DAY)
  })

  it('offers the same copy to the CDN, so one visitor warms it for the rest', () => {
    expect(seconds(mediaCacheControl(), 's-maxage')).toBeGreaterThanOrEqual(DAY)
  })

  it('refreshes behind an answer rather than making a page view wait for one', () => {
    expect(seconds(mediaCacheControl(), 'stale-while-revalidate')).toBeGreaterThan(
      seconds(mediaCacheControl(), 'max-age'),
    )
  })

  /**
   * A bare `/api/media/file/<filename>` is a URL anyone can request and that
   * nothing can invalidate, and this hook cannot tell one from a cache-tagged
   * URL. Keeping the window finite is what stops a replaced file being stranded
   * behind a copy no one can purge.
   */
  it('promises the copy for a while rather than forever', () => {
    const cacheControl = mediaCacheControl()

    expect(cacheControl).not.toContain('immutable')
    expect(seconds(cacheControl, 'max-age')).toBeLessThanOrEqual(7 * DAY)
  })

  /** Which is why the URLs the site renders name the revision they want. */
  it('addresses an upload by the revision it is serving', () => {
    const url = '/api/media/file/logo.webp'

    expect(getMediaUrl(url, '2026-01-01T00:00:00.000Z')).not.toBe(
      getMediaUrl(url, '2026-06-01T00:00:00.000Z'),
    )
  })
})

/**
 * A URL carrying a cache tag is answered by the media file route, which holds
 * the request and the finished response together and so can tell a tagged URL
 * from a bare one.
 *
 * These run the wrapper over real responses rather than reading a rule off a
 * config object. The rule this replaces was declared correctly in
 * `next.config.js` and never reached a single response — a route handler's own
 * `Cache-Control` overwrites one set from there — so a test that read the rule
 * passed throughout. Only an answer can show the difference.
 */
describe('an upload asked for by cache tag', () => {
  const MEDIA_URL = 'https://example.invalid/api/media/file/photo.webp'

  /** What the media route answers with before it is wrapped. */
  const served = (status = 200) =>
    new Response(status === 304 ? null : 'bytes', {
      headers: { 'Cache-Control': 'public, max-age=86400', 'Content-Type': 'image/webp' },
      status,
    })

  const answer = (url: string, response: Response = served()) =>
    withMediaCacheControl(new Request(url), response)

  const tagged = getMediaUrl(MEDIA_URL, REVISION)

  it('may be kept for a year, since replacing the file changes the URL', () => {
    const cacheControl = answer(tagged).headers.get('Cache-Control')

    expect(seconds(cacheControl, 'max-age')).toBeGreaterThanOrEqual(365 * DAY)
    expect(seconds(cacheControl, 's-maxage')).toBeGreaterThanOrEqual(365 * DAY)
  })

  it('is never revalidated, not even on a reload', () => {
    expect(answer(tagged).headers.get('Cache-Control')).toContain('immutable')
  })

  /** The bare URL is the one nothing can invalidate, so it keeps the short window. */
  it('leaves a URL naming no revision on the window the route set', () => {
    expect(answer(MEDIA_URL).headers.get('Cache-Control')).toBe('public, max-age=86400')
  })

  it('hands back the file the route served, and nothing else changed', async () => {
    expect(answer(tagged).headers.get('Content-Type')).toBe('image/webp')
    expect(await answer(tagged).text()).toBe('bytes')
  })

  /** A 304 answers "still fresh?", so it is what carries the new window home. */
  it('extends the window on a revalidation that found nothing to send', () => {
    const answered = answer(tagged, served(304))

    expect(answered.status).toBe(304)
    expect(answered.headers.get('Cache-Control')).toContain('immutable')
  })

  /** A year of 404 would outlive the upload that fixes it. */
  it('promises nothing for a file that was never served', () => {
    expect(
      answer(tagged, new Response(null, { status: 404 })).headers.get('Cache-Control'),
    ).toBeNull()
  })

  /**
   * The route reads the parameter by name, and `getMediaUrl` chooses that name.
   * Renaming one alone breaks no page — it drops every upload back to the media
   * route's short window, silently, which is why the two are pinned here.
   */
  it('is recognised on the very URLs the site renders', () => {
    const url = new URL(
      getMediaUrl('/api/media/file/photo.webp', REVISION),
      'https://example.invalid',
    )

    expect(url.searchParams.get(MEDIA_CACHE_TAG_PARAM)).toBe(REVISION)
    expect(answer(url.href).headers.get('Cache-Control')).toContain('immutable')
  })
})

describe('public asset caching', () => {
  it('names every file in public/, so none of them ships uncached', async () => {
    const { default: config } = await import('../../next.config.js')
    const rules = await config.headers!()

    const cached = rules.flatMap((rule) =>
      rule.headers.some(({ key }) => key.toLowerCase() === 'cache-control') ? [rule.source] : [],
    )

    // `public/media` is the local-disk fallback for uploads, which the media
    // route serves and caches itself.
    const files = readdirSync(join(process.cwd(), 'public'), { withFileTypes: true }).flatMap(
      (entry) => (entry.isFile() ? [`/${entry.name}`] : []),
    )

    expect(files).not.toHaveLength(0)
    files.forEach((file) => expect(cached).toContain(file))
  })
})

/**
 * The window the media route promises is finite but long, so a URL that omits
 * the revision it wants can be answered from a copy of the file it replaced.
 * Every URL the site hands out therefore names one.
 */
describe('the picture a document is shared with', () => {
  it('names the revision it wants, so a social card cannot outlive its picture', () => {
    expect(getImageURL(upload())).toContain(encodeURIComponent(REVISION))
  })

  it('names it for the generated og size as well as the original', () => {
    const image = upload({ sizes: { og: { url: '/api/media/file/photo-1200x630.webp' } } })

    expect(getImageURL(image)).toBe(
      `https://abonnes.randonnees-touloises.net/api/media/file/photo-1200x630.webp?${MEDIA_CACHE_TAG_PARAM}=${encodeURIComponent(REVISION)}`,
    )
  })

  it('still falls back to the site’s own image for a document carrying none', () => {
    expect(getImageURL(null)).toBe('https://abonnes.randonnees-touloises.net/og-image.jpg')
  })
})
