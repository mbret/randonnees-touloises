import type { MetadataRoute } from 'next'

import config from '@payload-config'
import { getPayload } from 'payload'

import { sitemapEntries } from '@/seo/sitemap'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Next caches this route by default and the collection hooks invalidate it by
 * path when a document is published, so a crawler is served a file rather than a
 * pair of queries. Nothing here changes without a write: every published post
 * is listed whatever its dates, so a programme entry that has passed stays in
 * the sitemap as its page stays up.
 */

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
