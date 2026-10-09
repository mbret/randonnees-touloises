import { upstreamFor } from '@/blocks/MediaLinks/thumbnailProxy'

/**
 * One media link's picture, fetched from Google by this server and handed on.
 *
 * The card's `srcset` could name Google directly, and Google would size it for
 * free. What that costs is the reader's privacy: their browser would announce
 * their address to Google on page load, before touching a link, which the
 * site's privacy notice says does not happen. So the browser asks this route,
 * and Google only ever hears from the server — once per picture per cache
 * window. See `thumbnailProxy.ts` for what may be asked and how it is checked.
 */

/**
 * A day in the browser, a month at the edge, and a week of serving the old
 * copy while a new one is fetched behind it — the map tiles' terms. A cover's
 * address names its photograph, so a new cover is a new address, and the long
 * edge window is what keeps this route from asking Google the same question
 * twice.
 */
const CACHE_CONTROL = 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800'

/** Long enough for Google to cut a picture; short enough not to hold a page's images open. */
const TIMEOUT_MS = 10_000

/**
 * What may be passed on. Raster formats only: an SVG served from this origin
 * could carry script, and nothing Google's image server returns needs one.
 */
const IMAGE_TYPES = new Set(['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'])

export const GET = async (request: Request): Promise<Response> => {
  const upstreamUrl = upstreamFor(new URL(request.url).searchParams)

  /* Not « bad request »: an address no page of this site would have asked for
   * is one that does not exist, which is also what a guessed URL should hear. */
  if (!upstreamUrl) return new Response(null, { status: 404 })

  let upstream: Response

  try {
    upstream = await fetch(upstreamUrl, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  } catch {
    /* The card keeps its muted band behind a missing picture, so Google being
     * slow or down costs an empty band and no stack trace. */
    return new Response(null, { status: 502 })
  }

  const type = upstream.headers.get('content-type')?.split(';')[0].trim() ?? ''

  if (!upstream.ok || !IMAGE_TYPES.has(type)) {
    await upstream.body?.cancel().catch(() => {})

    return new Response(null, { status: 502 })
  }

  return new Response(upstream.body, {
    headers: {
      'Cache-Control': CACHE_CONTROL,
      'Content-Type': type,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
