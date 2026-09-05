import type { Header as HeaderType } from '@/payload-types'

import { linkHref } from '@/utilities/linkHref'

export type HeaderNavItem = NonNullable<HeaderType['navItems']>[number]

/**
 * A nav entry and where it sits in the menu. One axis for every source: the
 * static entries below carry their place in code, a page carries the `navOrder`
 * an editor set on it, and anything without one falls back.
 */
export type OrderedNavItem = HeaderNavItem & { navOrder?: number | null }

type StaticNavItem = OrderedNavItem & { navOrder: number }

/**
 * Where an entry that names no order of its own sits: behind every static
 * entry, which is where a page has always landed.
 *
 * Deliberately not the `navOrder` field's `defaultValue`. A stored default
 * writes itself into every row as it is saved, so changing it later moves only
 * the pages saved since — and to move the rest you need a migration. Applied
 * here, the number is read at render time and one edit moves every page that
 * never asked for a position.
 */
export const DEFAULT_NAV_ORDER = 100

const navOrderOf = ({ navOrder }: OrderedNavItem) => navOrder ?? DEFAULT_NAV_ORDER

/**
 * Nav entries that belong to the site structure rather than to editorial
 * content, so they live in code and are always present regardless of what the
 * Header global contains.
 *
 * Spaced by ten rather than numbered off, so an editor can place a page
 * *between* two of them — the placement the menu is actually ever asked for —
 * without reaching for a decimal.
 */
export const staticNavItems: StaticNavItem[] = [
  {
    id: 'static-search',
    navOrder: 0,
    link: { label: 'Recherche', type: 'custom', url: '/search' },
  },
  {
    id: 'static-contact',
    navOrder: 10,
    link: { label: 'Contact', type: 'custom', url: '/contact' },
  },
  { id: 'static-about', navOrder: 30, link: { label: 'À propos', type: 'custom', url: '/about' } },
  {
    id: 'static-programs',
    navOrder: 50,
    link: { label: 'Programme hebdomadaire', type: 'custom', url: '/programs' },
  },
  /* `/board` has no route file of its own any more: it is a `pages` document,
   * rendered by `/[slug]`. The entry stays here rather than coming from the
   * page's own `showInNav`, so the conseil keeps its place in the menu whoever
   * edits the page — and because a static entry claims its address, the page's
   * own entry would be suppressed in favour of this one regardless. */
  {
    id: 'static-board',
    navOrder: 60,
    link: { label: 'Conseil d’administration', type: 'custom', url: '/board' },
  },
  {
    id: 'static-animation-team',
    navOrder: 70,
    link: { label: 'Équipe d’animation', type: 'custom', url: '/animation-team' },
  },
  {
    id: 'static-trombinoscope',
    navOrder: 80,
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
const isUnconditional = ({ link }: OrderedNavItem) =>
  !link.authCondition || link.authCondition === 'always'

/**
 * The whole menu, in the order it is read, from the three places entries come
 * from: the static entries above, the ones an editor added to the Header
 * global, and the ones the pages collection asked for.
 *
 * Position is `navOrder` and nothing else. Where a page could once only follow
 * the static entries — whatever number it named — one an editor puts at 15 now
 * lands between Contact (10) and À propos (30).
 *
 * An address appears once. A page a static entry already points at keeps the
 * static entry, and an editor naming that address by hand wins over the page's
 * own entry — nearest to the hand that placed it. Addresses are compared
 * resolved, so a reference to a page and that page's own entry are recognised
 * as the one link they render as. Deciding this before ordering rather than
 * after keeps it the same rule it was: which entry survives is a question about
 * who wrote it, not about where either one asked to sit.
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
  pageNavItems: OrderedNavItem[] = [],
): OrderedNavItem[] => {
  const claimed = new Set(staticUrls)
  const editorial: OrderedNavItem[] = []

  for (const item of [...(navItems ?? []), ...pageNavItems]) {
    /* Resolved, not read off `url`: `reference` is the default link type and
     * leaves `url` empty, so comparing addresses is the only way a reference to
     * a page and the page's own entry recognise each other. */
    const href = linkHref(item.link)

    if (href && claimed.has(href)) continue

    if (href && isUnconditional(item)) claimed.add(href)

    editorial.push(item)
  }

  /* Laid out editorial-first and sorted stably, so entries sharing an order
   * come out in the arrangement this list is written in: an editor's entry
   * ahead of the static entry it ties with — which is what lets `0` read as the
   * front of the menu rather than as second place behind Recherche — the Header
   * global's entries ahead of the pages collection's, the static entries in the
   * order they are listed above, and pages in the order `pageNavItems` sorted
   * them. */
  return [...editorial, ...staticNavItems].sort((a, b) => navOrderOf(a) - navOrderOf(b))
}
