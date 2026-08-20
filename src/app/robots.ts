import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/seo/absoluteUrl'
import { SITEMAP_PATH } from '@/seo/sitemap'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // `/admin` rather than the old `/admin/*`, which left the CMS login itself
      // crawlable. Everything else worth keeping out of an index is unreachable
      // without a session anyway.
      disallow: '/admin',
    },
    sitemap: absoluteUrl(SITEMAP_PATH),
  }
}
