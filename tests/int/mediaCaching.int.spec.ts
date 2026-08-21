import { readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { Media } from '@/collections/Media'
import { getMediaUrl } from '@/utilities/getMediaUrl'

/** The `Cache-Control` the media file route answers with. */
const mediaCacheControl = (): string | null => {
  const headers = new Headers()

  return (Media.upload as { modifyResponseHeaders: (args: { headers: Headers }) => Headers })
    .modifyResponseHeaders({ headers })
    .get('Cache-Control')
}

describe('media file caching', () => {
  it('lets a client keep an upload rather than revalidate it on every page view', () => {
    const cacheControl = mediaCacheControl()

    expect(cacheControl).toContain('public')
    expect(cacheControl).toContain('immutable')
    expect(cacheControl).not.toMatch(/max-age=0|no-store|must-revalidate/)
  })

  it('offers the same copy to the CDN, so one visitor warms it for the rest', () => {
    expect(mediaCacheControl()).toMatch(/s-maxage=\d{5,}/)
  })

  /**
   * What makes the header above safe: a replaced file is a new URL, so no cache
   * can be holding the bytes it used to serve.
   */
  it('addresses an upload by the revision it is serving', () => {
    const url = '/api/media/file/logo.webp'

    expect(getMediaUrl(url, '2026-01-01T00:00:00.000Z')).not.toBe(
      getMediaUrl(url, '2026-06-01T00:00:00.000Z'),
    )
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
