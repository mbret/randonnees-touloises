import type { MetadataRoute } from 'next'

import config from '@payload-config'
import { getPayload } from 'payload'

import { sitemapEntries } from '@/seo/sitemap'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Next caches this route by default and the collection hooks invalidate it by
 * path when a document is published, so a crawler is served a file rather than a
 * pair of queries. The hourly window is only the backstop for anything that
 * changes without a write — a programme entry ageing out of the listing, say.
 */
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  const published = {
    overrideAccess: false,
    draft: false,
    depth: 0,
    limit: 1000,
    pagination: false,
    where: { _status: { equals: 'published' } },
  } as const

  const [pages, posts] = await Promise.all([
    payload.find({
      ...published,
      collection: 'pages',
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      ...published,
      collection: 'posts',
      select: { schedule: true, slug: true, updatedAt: true },
    }),
  ])

  return sitemapEntries({
    pages: pages.docs ?? [],
    posts: posts.docs ?? [],
    siteUrl: getServerSideURL(),
  })
}
