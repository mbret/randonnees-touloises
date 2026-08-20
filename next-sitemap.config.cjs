// Keep in sync with `getServerSideURL()` in src/utilities/getURL.ts. This file is
// CommonJS (loaded by the next-sitemap CLI), so it cannot import the TS helper.
// `VERCEL_PROJECT_PRODUCTION_URL` is a bare host with no scheme, so it must be
// prefixed — otherwise every `<loc>` and `Sitemap:` line is emitted scheme-less
// and rejected by search engines.
const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

/**
 * next-sitemap runs after the build and can only see the routes Next emitted, so
 * on its own it would advertise the prerendered subset and miss everything the
 * CMS adds. It is kept for robots.txt alone: the sitemaps themselves are served
 * at request time from src/seo/sitemap.ts, and every route is excluded here so
 * that none is claimed by both. `*` spans slashes in next-sitemap's matcher, so
 * `/*` is the whole site rather than its first level.
 */
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: ['/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: '/admin/*',
      },
    ],
    additionalSitemaps: [`${SITE_URL}/pages-sitemap.xml`, `${SITE_URL}/posts-sitemap.xml`],
  },
}
