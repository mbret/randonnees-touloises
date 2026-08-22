/**
 * The hosts an automatic media-link thumbnail may be served from.
 *
 * One list, read by two places that must not disagree: `next.config.js` turns
 * it into `images.remotePatterns`, and `thumbnails.ts` refuses to return a
 * thumbnail it does not match. The two are not merely tidier together — they
 * are load-bearing for each other. `next/image` *throws* on a host missing from
 * `remotePatterns` rather than degrading, and that throw happens while a server
 * component renders, so it takes the whole page down with it. A resolved
 * `og:image` on an unlisted host therefore has to be dropped before it ever
 * reaches the component.
 *
 * Named hosts rather than a wildcard, because this list is also the only thing
 * standing between `/_next/image` and an open image proxy: anything matched
 * here can be fetched and re-served by this site on behalf of whoever crafts
 * the URL.
 *
 * Plain JavaScript so that `next.config.js`, which is not compiled, can import
 * it. `allowJs` lets the TypeScript side read it too.
 */
export const THUMBNAIL_REMOTE_PATTERNS = [
  /** Google Photos album covers (`lh3`) and YouTube channel avatars (`yt3`). */
  { protocol: 'https', hostname: '**.googleusercontent.com' },
  /** Video stills, which are derived from a video id rather than fetched. */
  { protocol: 'https', hostname: 'i.ytimg.com' },
]

/**
 * Whether `next/image` will accept this address.
 *
 * A deliberately narrower reading of the patterns than Next's own matcher:
 * `**.example.com` is taken to require a subdomain, where micromatch may be
 * more generous. Erring strict is the safe direction — the cost of rejecting
 * something Next would have allowed is a card that falls back to its platform
 * icon, while the cost of allowing something Next rejects is a crashed page.
 *
 * @param {string} src
 * @returns {boolean}
 */
export const isAllowedThumbnailHost = (src) => {
  let url

  try {
    url = new URL(src)
  } catch {
    return false
  }

  return THUMBNAIL_REMOTE_PATTERNS.some(({ protocol, hostname }) => {
    if (url.protocol !== `${protocol}:`) return false

    if (hostname.startsWith('**.')) return url.hostname.endsWith(hostname.slice(2))

    return url.hostname === hostname
  })
}
