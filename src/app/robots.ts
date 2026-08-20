import type { MetadataRoute } from 'next'

import { SITEMAP_PATH } from '@/seo/sitemap'
import { getServerSideURL } from '@/utilities/getURL'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getServerSideURL()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // `/admin` rather than the old `/admin/*`, which left the CMS login itself
      // crawlable. Everything else worth keeping out of an index is unreachable
      // without a session anyway.
      disallow: '/admin',
    },
    sitemap: `${siteUrl}${SITEMAP_PATH}`,
  }
}
