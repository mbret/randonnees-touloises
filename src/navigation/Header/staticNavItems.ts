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
]

const staticUrls = new Set(
  staticNavItems.map(({ link }) => link.url).filter((url): url is string => Boolean(url)),
)

/**
 * The static entries followed by the CMS ones, dropping any CMS item that
 * points at a static link so the two cannot render twice.
 */
export const withStaticNavItems = (navItems: HeaderType['navItems']): HeaderNavItem[] => [
  ...staticNavItems,
  ...(navItems ?? []).filter(({ link }) => !link.url || !staticUrls.has(link.url)),
]
