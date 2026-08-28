/**
 * How a media URL names the revision of the file it wants.
 *
 * One name, read by two places that must not disagree: `getMediaUrl` stamps it
 * onto every URL the site renders, and `next.config.js` matches on it to decide
 * which requests may be cached forever. A rename on one side alone does not
 * break a page — it silently drops every upload back to the short window, which
 * is why `mediaCaching.int.spec.ts` pins the two together.
 *
 * Plain JavaScript so that `next.config.js`, which is not compiled, can import
 * it. `allowJs` lets the TypeScript side read it too — the same arrangement as
 * `thumbnailHosts.js`.
 */
export const MEDIA_REVISION_PARAM = 'v'

/**
 * What a URL naming its revision may promise.
 *
 * The revision comes from the document's `updatedAt`, so replacing a file
 * changes every URL the site renders for it: the bytes behind any one of them
 * never change, and a client that already holds one never needs to ask again.
 * `immutable` says exactly that — not merely "fresh for a year" but "do not
 * revalidate, even on reload".
 *
 * A URL *without* a revision — Payload's admin renders one, and so does anyone
 * who has linked a file directly — cannot make that promise, and is left on the
 * shorter window the media route sets for itself. That is the whole reason this
 * lives here rather than in the collection's `modifyResponseHeaders`, which is
 * handed the response alone and cannot tell the two apart.
 */
export const MEDIA_IMMUTABLE_CACHE_CONTROL =
  'public, max-age=31536000, s-maxage=31536000, immutable'
