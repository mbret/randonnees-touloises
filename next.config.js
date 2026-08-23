import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'
import { THUMBNAIL_REMOTE_PATTERNS } from './src/blocks/MediaLinks/thumbnailHosts.js'

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
]

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

/**
 * Everything the site reads from Payload is cached under a tag that a collection
 * hook fires on write, so an editor never waits for a timer. The windows below
 * are only the backstop for what changes without a write — a programme entry
 * ageing out of a listing, a migration run straight against the database.
 *
 * `hours` and `days` already carry the windows this site used before Cache
 * Components (an hour, a day). Ten minutes, which the listings used, has no
 * preset, so it is named here rather than repeated as an inline profile at each
 * of the five call sites.
 */
const cacheLife = {
  listing: {
    stale: 300,
    revalidate: 600,
    expire: 86400,
  },
  /**
   * For `cachedTodayInFrance`, the one reader whose lifetime is about the clock
   * rather than about content: it decides how soon after midnight the agenda and
   * the programme notice the day turned.
   *
   * An hour, because the shortest lifetime anywhere in a route's tree becomes
   * that route's own: a keener profile here would have the home page regenerate
   * on that cadence instead, which is what it cost before this profile existed
   * and no more precise for it. The `stale` stays at the five minutes every
   * preset uses — under that, a value is held out of the route's App Shell, and
   * under thirty seconds out of prerendering altogether, which would take the
   * agenda out of the static shell it is being cached to reach.
   */
  clock: {
    stale: 300,
    revalidate: 3600,
    expire: 86400,
  },
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Caching is per function and per component rather than per route: a reader
   * declares its own lifetime with `use cache` and `cacheLife`, and the route
   * segment configs this replaced (`dynamic`, `revalidate`) are no longer read.
   * Partial Prerendering comes with it, so every route ships a static shell and
   * anything request-bound streams in behind a `<Suspense>` fallback.
   */
  cacheComponents: true,
  cacheLife,
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
    localPatterns: [
      { pathname: '/api/media/file/**' },
      { pathname: '**', search: '' },
    ],
  },
  reactStrictMode: true,
  redirects,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
