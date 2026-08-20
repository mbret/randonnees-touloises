import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

/**
 * The staging copy of the site, served from the legacy site's registered domain.
 *
 * It is a full public duplicate of the production content, so leaving it
 * crawlable would let it compete with the legacy `www.` host as near-duplicate
 * content and leave a second set of indexed URLs to clean up at cutover.
 * `robots.txt` cannot help here: it is a single static file that cannot vary
 * per host, and `Disallow` still permits URL-only indexing.
 *
 * CUTOVER: drop this rule once the site is live on its production host. The
 * match is host-scoped, so it never touches production as things stand — but
 * pointing `abonnes.` at the live site later would silently deindex it.
 */
const TEMPORARY_HOST = 'abonnes\\.randonnees-touloises\\.net' // `has.value` is an anchored regex

const headers = async () => [
  {
    has: [{ type: 'host', value: TEMPORARY_HOST }],
    headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    source: '/:path*',
  },
]

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  headers,
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
    // Next 16 narrowed the default allowed qualities to [75]; ImageMedia
    // requests quality={100}, so both have to be opted in explicitly.
    qualities: [75, 100],
    /**
     * Next 16 defaults to `[{ pathname: '**', search: '' }]`, which rejects any
     * local image carrying a query string. Payload media is served from our own
     * /api/media/file route and cache-busted with `?<updatedAt>`, so prerendering
     * any page with a portrait threw E871.
     *
     * `search` only accepts a literal query string, and the cache tag differs per
     * document, so the media entry omits it — an omitted `search` matches any.
     * The second entry restores the default for every other local image.
     */
    localPatterns: [
      { pathname: '/api/media/file/**' },
      { pathname: '**', search: '' },
    ],
  },
  reactStrictMode: true,
  redirects,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
