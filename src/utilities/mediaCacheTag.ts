/**
 * The name a media URL spells its cache tag under.
 *
 * The tag itself is the document's `updatedAt`, which `getMediaUrl` stamps onto
 * every URL the site renders: replacing a file changes the tag, so it changes
 * the URL, so nothing can be served a copy of the file it replaced.
 *
 * One name, read by two places that must not disagree: `getMediaUrl` writes it,
 * and the media file route reads it back to decide which requests may be cached
 * forever. A rename on one side alone does not break a page — it silently drops
 * every upload back to the short window, which is why `mediaCaching.int.spec.ts`
 * pins the two together.
 */
export const MEDIA_CACHE_TAG_PARAM = 'v'

/**
 * What a URL carrying a cache tag may promise.
 *
 * The bytes behind such a URL never change, so a client that already holds one
 * never needs to ask again. `immutable` says exactly that — not merely "fresh
 * for a year" but "do not revalidate, even on reload".
 *
 * A URL *without* one cannot make that promise, and is left on the shorter
 * window the media collection sets for itself: a file linked directly — from a
 * newsletter, from the legacy site, from anywhere outside this codebase — is
 * asked for under a name that does not change when the bytes behind it do, so a
 * year of `immutable` on it would be unfixable without purging a CDN. That is
 * the whole reason this is applied per request rather than in
 * `modifyResponseHeaders`, which is handed the response alone and cannot tell
 * the two apart.
 *
 * Payload's admin is not one of those, despite the obvious guess: it stamps its
 * own tag on a thumbnail (`upload.cacheTags`, on by default) as an *unnamed*
 * query parameter, which does not match the name below. So the admin is
 * answered on the short window too — correct, and it costs one revalidation a
 * day rather than a stale portrait for a year.
 */
export const MEDIA_IMMUTABLE_CACHE_CONTROL =
  'public, max-age=31536000, s-maxage=31536000, immutable'

/**
 * Statuses that must be answered with no body at all, so re-wrapping one has to
 * drop the body rather than pass it through. The media route reaches 304 by
 * matching an `ETag`, and 204 only in principle; the rest are here so the set
 * reads as the rule it is.
 */
const BODILESS_STATUSES = new Set([101, 204, 205, 304])

/** A file we actually served is the only thing worth keeping for a year. */
const isServedFile = (response: Response) => response.ok || response.status === 304

/**
 * Re-answers a file that was asked for by revision with the header it has
 * earned.
 *
 * This has to be done here, holding both the request and the finished response,
 * because neither of the two obvious places can see both:
 *
 * - The collection's `modifyResponseHeaders` is handed the response alone. It
 *   cannot tell `?v=<updatedAt>` from a bare `/api/media/file/<filename>` — a
 *   URL anyone can request and nothing can invalidate — so it has to answer
 *   both with the short window the bare kind needs.
 * - `next.config.js` *can* see the request: `has` matches the tag by name. But
 *   a `Cache-Control` it sets is overwritten by the one the route handler puts
 *   on its own `Response`, so the rule matched and did nothing. That is how
 *   this shipped: tagged uploads came back with the collection's day rather
 *   than the year they were meant to get, while the sibling `X-Robots-Tag`
 *   rule — which no handler sets — arrived on the very same responses.
 *
 * Anything that is not a served file is left exactly as Payload made it: a 404,
 * a 500 or a redirect to a signed URL is not something to keep for a year.
 */
export const withMediaCacheControl = (request: Request, response: Response): Response => {
  const tagged = new URL(request.url).searchParams.has(MEDIA_CACHE_TAG_PARAM)

  if (!tagged || !isServedFile(response)) return response

  const headers = new Headers(response.headers)
  headers.set('Cache-Control', MEDIA_IMMUTABLE_CACHE_CONTROL)

  return new Response(BODILESS_STATUSES.has(response.status) ? null : response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}
