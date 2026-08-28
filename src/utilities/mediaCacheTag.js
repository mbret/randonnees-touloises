/**
 * The name a media URL spells its cache tag under.
 *
 * The tag itself is the document's `updatedAt`, which `getMediaUrl` stamps onto
 * every URL the site renders: replacing a file changes the tag, so it changes
 * the URL, so nothing can be served a copy of the file it replaced.
 *
 * One name, read by two places that must not disagree: `getMediaUrl` writes it,
 * and `next.config.js` matches on it to decide which requests may be cached
 * forever. A rename on one side alone does not break a page — it silently drops
 * every upload back to the short window, which is why
 * `mediaCaching.int.spec.ts` pins the two together.
 *
 * Plain JavaScript so that `next.config.js`, which is not compiled, can import
 * it. `allowJs` lets the TypeScript side read it too — the same arrangement as
 * `thumbnailHosts.js`.
 */
export const MEDIA_CACHE_TAG_PARAM = 'v'

/**
 * What a URL carrying a cache tag may promise.
 *
 * The bytes behind such a URL never change, so a client that already holds one
 * never needs to ask again. `immutable` says exactly that — not merely "fresh
 * for a year" but "do not revalidate, even on reload".
 *
 * A URL *without* a tag — Payload's admin renders one, and so does anyone who
 * has linked a file directly — cannot make that promise, and is left on the
 * shorter window the media route sets for itself. That is the whole reason this
 * lives here rather than in the collection's `modifyResponseHeaders`, which is
 * handed the response alone and cannot tell the two apart.
 */
export const MEDIA_IMMUTABLE_CACHE_CONTROL =
  'public, max-age=31536000, s-maxage=31536000, immutable'
