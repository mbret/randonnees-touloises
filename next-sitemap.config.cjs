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

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: ['/posts-sitemap.xml', '/pages-sitemap.xml', '/*', '/posts/*'],
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
