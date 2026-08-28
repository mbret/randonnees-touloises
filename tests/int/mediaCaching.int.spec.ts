import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { beforeAll, describe, expect, it } from 'vitest'

import type { Media as MediaDoc } from '@/payload-types'

import { Media } from '@/collections/Media'
import { getImageURL } from '@/seo/imageUrl'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { MEDIA_REVISION_PARAM } from '@/utilities/mediaRevision.js'

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
 * A URL that names the revision it wants is answered by `next.config.js`
 * instead, where the request — and so the revision — is visible.
 */
describe('an upload asked for by revision', () => {
  /** The rules `next.config.js` declares, as Next will read them. */
  const headerRules = async () => {
    const { default: config } = await import('../../next.config.js')

    return await config.headers!()
  }

  /** The rule that answers a media URL naming its revision, if there is one. */
  const revisionedMediaRule = async () =>
    (await headerRules()).find(
      (rule) =>
        rule.source.startsWith('/api/media/file') &&
        rule.has?.some(({ key, type }) => type === 'query' && key === MEDIA_REVISION_PARAM),
    )

  it('may be kept for a year, since replacing the file changes the URL', async () => {
    const cacheControl = (await revisionedMediaRule())?.headers.find(
      ({ key }) => key.toLowerCase() === 'cache-control',
    )?.value

    expect(seconds(cacheControl ?? null, 'max-age')).toBeGreaterThanOrEqual(365 * DAY)
    expect(seconds(cacheControl ?? null, 's-maxage')).toBeGreaterThanOrEqual(365 * DAY)
  })

  it('is never revalidated, not even on a reload', async () => {
    const cacheControl = (await revisionedMediaRule())?.headers.find(
      ({ key }) => key.toLowerCase() === 'cache-control',
    )?.value

    expect(cacheControl).toContain('immutable')
  })

  /**
   * The rule matches a query parameter by name, and `getMediaUrl` chooses that
   * name. Renaming one alone breaks no page — it drops every upload back to the
   * media route's short window, silently, which is why the two are pinned here.
   */
  it('is recognised by the very URLs the site renders', async () => {
    const rule = await revisionedMediaRule()
    const url = new URL(
      getMediaUrl('/api/media/file/photo.webp', REVISION),
      'https://example.invalid',
    )

    expect(rule).toBeDefined()
    expect(url.searchParams.get(MEDIA_REVISION_PARAM)).toBe(REVISION)
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
      `https://abonnes.randonnees-touloises.net/api/media/file/photo-1200x630.webp?${MEDIA_REVISION_PARAM}=${encodeURIComponent(REVISION)}`,
    )
  })

  it('still falls back to the site’s own image for a document carrying none', () => {
    expect(getImageURL(null)).toBe('https://abonnes.randonnees-touloises.net/og-image.jpg')
  })
})
