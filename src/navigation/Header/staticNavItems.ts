import type { Header as HeaderType } from '@/payload-types'

import { linkHref } from '@/utilities/linkHref'

export type HeaderNavItem = NonNullable<HeaderType['navItems']>[number]

/**
 * Nav entries that belong to the site structure rather than to editorial
 * content, so they live in code and are always present regardless of what the
 * Header global contains. They are rendered ahead of the CMS items, which also
 * keeps them out of the "Plus" overflow menu on narrow viewports.
 */
export const staticNavItems: HeaderNavItem[] = [
  { id: 'static-search', link: { label: 'Recherche', type: 'custom', url: '/search' } },
  { id: 'static-contact', link: { label: 'Contact', type: 'custom', url: '/contact' } },
  { id: 'static-news', link: { label: 'Actualités', type: 'custom', url: '/news' } },
  { id: 'static-about', link: { label: 'À propos', type: 'custom', url: '/about' } },
  { id: 'static-activities', link: { label: 'Nos activités', type: 'custom', url: '/activities' } },
  {
    id: 'static-programs',
    link: { label: 'Programme hebdomadaire', type: 'custom', url: '/programs' },
  },
  {
    id: 'static-board',
    link: { label: 'Conseil d’administration', type: 'custom', url: '/board' },
  },
  {
    id: 'static-animation-team',
    link: { label: 'Équipe d’animation', type: 'custom', url: '/animation-team' },
  },
  {
    id: 'static-trombinoscope',
    link: { label: 'Trombinoscope', type: 'custom', url: '/trombinoscope' },
  },
]

const staticUrls = new Set(
  staticNavItems.map(({ link }) => linkHref(link)).filter((url): url is string => Boolean(url)),
)

/**
 * An entry every reader sees. Only such an entry may claim an address, because
 * an entry shown to one audience must not remove the entry the other audience
 * would have been left with.
 */
const isUnconditional = ({ link }: HeaderNavItem) =>
  !link.authCondition || link.authCondition === 'always'

/**
 * The static entries, then the ones an editor added to the Header global, then
 * the ones the pages collection asked for.
 *
 * An address appears once. A page a static entry already points at keeps the
 * static entry, and an editor naming that address by hand wins over the page's
 * own entry — nearest to the hand that placed it. Addresses are compared
 * resolved, so a reference to a page and that page's own entry are recognised
 * as the one link they render as.
 *
 * Only an entry every reader sees claims its address. An entry restricted to
 * one audience is kept alongside the unrestricted one it would otherwise have
 * displaced, since suppressing it would leave the other audience with no link
 * at all — at the cost of the restricted audience seeing both. Two entries
 * restricted to opposite audiences therefore both survive, which is the point
 * of writing them.
 *
 * An entry whose address cannot be resolved — a reference whose document was
 * never populated — collides with nothing and is left alone.
 */
export const withStaticNavItems = (
  navItems: HeaderType['navItems'],
  pageNavItems: HeaderNavItem[] = [],
): HeaderNavItem[] => {
  const claimed = new Set(staticUrls)
  const merged = [...staticNavItems]

  for (const item of [...(navItems ?? []), ...pageNavItems]) {
    /* Resolved, not read off `url`: `reference` is the default link type and
     * leaves `url` empty, so comparing addresses is the only way a reference to
     * a page and the page's own entry recognise each other. */
    const href = linkHref(item.link)

    if (href && claimed.has(href)) continue

    if (href && isUnconditional(item)) claimed.add(href)

    merged.push(item)
  }

  return merged
}
