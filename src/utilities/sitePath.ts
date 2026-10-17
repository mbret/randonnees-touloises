import { getClientSideURL } from './getURL'

/**
 * The path a link lands on within this site, or `null` when it leaves the site.
 *
 * Read through `URL` rather than off the string, because an address typed into
 * the CMS has more than one spelling for the same route: `/search/` is
 * `/search` once Next has dropped the slash, and the site's own full address is
 * a local link to `next/link`. A rule about a route has to see all of them as
 * that route.
 */
export const sitePathOf = (href: string): string | null => {
  const site = new URL(getClientSideURL() || 'http://localhost')

  let url: URL
  try {
    url = new URL(href, site)
  } catch {
    return null
  }

  if (url.origin !== site.origin) return null

  return url.pathname.replace(/\/+$/, '') || '/'
}
