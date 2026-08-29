import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { pagePath } from '@/utilities/pagePath'
import { DEFAULT_NAV_ORDER, type OrderedNavItem } from './staticNavItems'

/**
 * The menu entries the pages collection asks for, read rather than copied.
 *
 * Nothing writes these into the Header global. The collection stays the only
 * record of which pages belong in the menu, so unpublishing or deleting a page
 * takes its entry with it — a copy would outlive the page and leave a link to a
 * 404 behind, and keeping a copy honest would mean a hook for every way a page
 * can change: publish, unpublish, retitle, re-slug, delete.
 *
 * Only published pages are asked for, which is what makes the default on
 * `showInNav` safe to leave on: a page drafted for weeks stays out of the menu
 * until the moment it goes live.
 *
 * Cached under the header's own tag, so `revalidateHeader` and `revalidatePage`
 * both refresh it.
 */
const getPageNavItems = async (): Promise<OrderedNavItem[]> => {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'pages',
    depth: 0,
    pagination: false,
    select: { navLabel: true, navOrder: true, slug: true, title: true },
    where: {
      _status: { equals: 'published' },
      showInNav: { equals: true },
    },
  })

  /* `withStaticNavItems` sorts the menu it assembles, so what this ordering
   * settles is only which of two pages naming the same order comes first. It is
   * done here rather than in the query because Postgres puts nulls at one end
   * of an ORDER BY whatever the direction, and an unset order is a page asking
   * for `DEFAULT_NAV_ORDER` rather than for either extreme. */
  return docs
    .filter((page) => Boolean(page.slug))
    .sort(
      (a, b) =>
        (a.navOrder ?? DEFAULT_NAV_ORDER) - (b.navOrder ?? DEFAULT_NAV_ORDER) ||
        (a.title ?? '').localeCompare(b.title ?? '', 'fr'),
    )
    .map((page) => ({
      id: `page-${page.id}`,
      navOrder: page.navOrder,
      link: {
        label: page.navLabel || page.title,
        type: 'custom' as const,
        url: pagePath(page),
      },
    }))
}

export const getCachedPageNavItems = unstable_cache(getPageNavItems, ['pageNavItems'], {
  tags: ['global_header'],
})
