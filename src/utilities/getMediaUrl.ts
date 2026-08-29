import { MEDIA_CACHE_TAG_PARAM } from './mediaCacheTag'

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL — callers pass the
 *   document's `updatedAt`, so a replaced file is asked for under a new URL
 * @returns Properly formatted URL with cache tag if provided
 *
 * Collection-hosted media is left as the origin-relative path Payload gives us
 * rather than being resolved against the current origin. Resolving it meant
 * branching on whether the DOM existed, so the server rendered a relative `src`
 * and the browser an absolute one — a hydration mismatch on every image — and it
 * pushed our own files through the image optimiser as if they were remote.
 * Storage adapters hand back absolute URLs, which still pass through untouched.
 *
 * The tag is written as a named parameter rather than a bare query string, so
 * that the media file route can recognise a URL carrying one: it looks the
 * parameter up by name, and a tag has no fixed value to match on. Naming it is
 * what lets those URLs be cached forever — see `mediaCacheTag.ts`.
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  if (!cacheTag) return url

  return `${url}?${MEDIA_CACHE_TAG_PARAM}=${encodeURIComponent(cacheTag)}`
}
