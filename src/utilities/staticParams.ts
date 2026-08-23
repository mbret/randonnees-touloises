/**
 * The slug a route is prerendered with when its collection is empty.
 *
 * Cache Components validates a dynamic route by prerendering it, so it refuses
 * an empty `generateStaticParams`: there would be no render to validate. A
 * collection with nothing published in it — a fresh database, a section the club
 * has not written yet — would therefore fail the build outright.
 *
 * There is no collision to worry about. The fallback is reached only when the
 * query came back empty, which is precisely when no document can be holding this
 * slug, so the route prerenders the 404 every unknown slug already gets.
 */
const EMPTY_COLLECTION_SLUG = 'aucun-document'

/**
 * `params` as given, or one throwaway slug if there are none. See
 * `EMPTY_COLLECTION_SLUG` for why a dynamic route cannot be left without one.
 */
export const withFallbackSlug = <T extends { slug?: null | string }>(
  params: T[],
): ({ slug?: null | string } | T)[] => (params.length > 0 ? params : [{ slug: EMPTY_COLLECTION_SLUG }])
