import type { HeaderNavItem } from './staticNavItems'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import { pagePath } from '@/utilities/pagePath'

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
const getPageNavItems = async (): Promise<HeaderNavItem[]> => {
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

  /* Sorted here rather than in the query: Postgres puts nulls at one end of an
   * ORDER BY whatever the direction, and an unset order should read as zero. */
  return docs
    .filter((page) => Boolean(page.slug))
    .sort(
      (a, b) =>
        (a.navOrder ?? 0) - (b.navOrder ?? 0) ||
        (a.title ?? '').localeCompare(b.title ?? '', 'fr'),
    )
    .map((page) => ({
      id: `page-${page.id}`,
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
