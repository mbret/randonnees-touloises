import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'
import { THUMBNAIL_REMOTE_PATTERNS } from './src/blocks/MediaLinks/thumbnailHosts.js'
import {
  MEDIA_CACHE_TAG_PARAM,
  MEDIA_IMMUTABLE_CACHE_CONTROL,
} from './src/utilities/mediaCacheTag.js'

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

/**
 * Files in `public/` are served under the name they were committed with, and
 * anything without a `Cache-Control` of its own is answered `public, max-age=0,
 * must-revalidate`: the browser holds a copy but has to ask about it on every
 * page view, which cost the favicon alone half a second a load. It also leaked
 * into `next/image`, which passes the upstream `Cache-Control` through to the
 * optimised variant — so no optimised copy of a `public/` image was cacheable
 * either.
 *
 * Give them a real, short freshness window plus a week of
 * `stale-while-revalidate`, so a repeat visit paints from cache and the refresh
 * happens behind it. The names never change, so the window is also the delay
 * before a deploy that replaces one of these files is seen; an image that wants
 * caching forever belongs in `src/assets` as a static import, whose filename
 * carries a hash of its contents.
 */
const PUBLIC_ASSET_CACHE_CONTROL = 'public, max-age=3600, stale-while-revalidate=604800'

const PUBLIC_ASSETS = ['/favicon.ico', '/favicon.svg', '/og-image.jpg']

const headers = async () => [
  {
    has: [{ type: 'host', value: TEMPORARY_HOST }],
    headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    source: '/:path*',
  },
  ...PUBLIC_ASSETS.map((source) => ({
    headers: [{ key: 'Cache-Control', value: PUBLIC_ASSET_CACHE_CONTROL }],
    source,
  })),
  /**
   * An upload asked for by cache tag can be kept forever.
   *
   * The media route sets its own `Cache-Control`, but it is handed the response
   * and nothing else, so it cannot tell a tagged URL from a bare one and has to
   * answer both with the shorter window a bare URL needs. Here the request is
   * visible, so the two can be told apart: `has` matches the cache-tag
   * parameter `getMediaUrl` stamps, and this rule replaces the header on
   * exactly those URLs. Everything else keeps what the route set.
   *
   * Same split Next itself draws between `/_next/static`, whose filenames carry
   * a build hash, and `public/` above, whose do not.
   */
  {
    has: [{ type: 'query', key: MEDIA_CACHE_TAG_PARAM }],
    headers: [{ key: 'Cache-Control', value: MEDIA_IMMUTABLE_CACHE_CONTROL }],
    source: '/api/media/file/:path*',
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
      /**
       * Where the `mediaLinks` block's automatic thumbnails come from. Defined
       * beside the block, because the resolver has to refuse exactly what this
       * list refuses — see the note in `thumbnailHosts.js`.
       */
      ...THUMBNAIL_REMOTE_PATTERNS,
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
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '**', search: '' }],
  },
  reactStrictMode: true,
  redirects,
  /**
   * Cache Components: `use cache` and `cacheLife` replace the `dynamic` and
   * `revalidate` route segment configs, and validation reports in `next dev`
   * which navigations would not be instant.
   */
  cacheComponents: true,
  /**
   * One reusable App Shell is prefetched per route rather than a separate
   * prefetch per visible link, so the many cards on the home page and the
   * listings that point at the same route cost one request between them.
   */
  partialPrefetching: true,
  cacheLife: {
    /**
     * The cadence the listings and the portrait pages were on as
     * `revalidate = 600`. The built-in `minutes` profile revalidates every
     * minute, which would be ten times the database traffic for content that
     * changes a few times a week.
     */
    tenMinutes: {
      stale: 300, // 5 minutes
      revalidate: 600, // 10 minutes
      expire: 3600, // 1 hour
    },
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
