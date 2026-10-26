import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/seo/absoluteUrl'
import { SITEMAP_PATH } from '@/seo/sitemap'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // `/admin` rather than the old `/admin/*`, which left the CMS login itself
      // crawlable. `/search` queries the database on every request, so crawling it
      // wakes Neon.
      disallow: ['/admin', '/search'],
    },
    sitemap: absoluteUrl(SITEMAP_PATH),
  }
}
