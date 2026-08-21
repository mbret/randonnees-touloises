import type { Header as HeaderType } from '@/payload-types'

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
  staticNavItems.map(({ link }) => link.url).filter((url): url is string => Boolean(url)),
)

/**
 * The static entries, then the ones an editor added to the Header global, then
 * the ones the pages collection asked for.
 *
 * An address may only appear once. A page that a static entry already points at
 * keeps the static entry, and an editor who names the same address by hand wins
 * over the page's own entry — nearest to the hand that placed it. Entries
 * without a URL are left alone, having no address to collide on.
 */
export const withStaticNavItems = (
  navItems: HeaderType['navItems'],
  pageNavItems: HeaderNavItem[] = [],
): HeaderNavItem[] => {
  const claimed = new Set(staticUrls)
  const merged = [...staticNavItems]

  for (const item of [...(navItems ?? []), ...pageNavItems]) {
    const { url } = item.link

    if (url) {
      if (claimed.has(url)) continue
      claimed.add(url)
    }

    merged.push(item)
  }

  return merged
}
