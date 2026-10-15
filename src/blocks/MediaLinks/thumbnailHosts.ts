/**
 * The hosts an automatic media-link thumbnail may come from.
 *
 * Read in two places that must agree: `thumbnails.ts` drops an `og:image`
 * found anywhere else, and the thumbnail route will not fetch from anywhere
 * else. The route serves only addresses this site has signed, so the list is
 * not what stops it being an open proxy. It is what keeps a page that declares
 * its picture on some other server, or a signing key that got out, from
 * turning the route into a fetcher of arbitrary hosts.
 *
 * Named hosts rather than a wildcard over the web: `**.example.com` is read as
 * any subdomain of it, and nothing broader.
 */
const THUMBNAIL_HOSTS = [
  /** Google Photos album covers (`lh3`) and YouTube channel avatars (`yt3`). */
  '**.googleusercontent.com',
  /** Video stills, which are derived from a video id rather than fetched. */
  'i.ytimg.com',
]

/** Whether a thumbnail at this address may be fetched, which also means over HTTPS. */
export const isAllowedThumbnailHost = (src: string): boolean => {
  let url: URL

  try {
    url = new URL(src)
  } catch {
    return false
  }

  if (url.protocol !== 'https:') return false

  /* `slice(2)` keeps the dot — `.googleusercontent.com` — so the match falls on
   * a label boundary: `notgoogleusercontent.com`, somebody else's domain, does
   * not end with it, and neither does the bare domain. */
  return THUMBNAIL_HOSTS.some((host) =>
    host.startsWith('**.') ? url.hostname.endsWith(host.slice(2)) : url.hostname === host,
  )
}
