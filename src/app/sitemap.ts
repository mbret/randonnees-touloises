import type { MetadataRoute } from 'next'

import config from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'

import { sitemapEntries } from '@/seo/sitemap'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * Everything the file is built from, cached together so a crawler is served a
 * file rather than a pair of queries. Tagged with both listings, which
 * `revalidatePost` fires on any write that reaches one, and with the header tag
 * that `revalidatePage` fires — between them, every publish that can add or
 * remove a URL here. The hour behind that is the backstop for what changes
 * without a write, such as a programme entry ageing out of the listing.
 */
const getSitemapDocuments = async () => {
  'use cache'
  cacheLife('hours')
  cacheTag('news')
  cacheTag('programs')
  cacheTag('global_header')

  const payload = await getPayload({ config })

  const published = {
    overrideAccess: false,
    draft: false,
    depth: 0,
    limit: 1000,
    pagination: false,
    where: { _status: { equals: 'published' } },
  } as const

  return Promise.all([
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
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts] = await getSitemapDocuments()

  return sitemapEntries({
    pages: pages.docs ?? [],
    posts: posts.docs ?? [],
    siteUrl: getServerSideURL(),
  })
}
