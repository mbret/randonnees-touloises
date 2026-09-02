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
 * CUTOVER: drop this host once the site is live on its production host. The
 * match is host-scoped, so it never touches production as things stand — but
 * pointing `abonnes.` at the live site later would silently deindex it.
 */
const TEMPORARY_HOST = 'abonnes\\.randonnees-touloises\\.net' // `has.value` is an anchored regex

/**
 * The addresses Vercel gives a deployment of its own accord: the project's
 * production alias, `randonnees-touloises.vercel.app`, and the per-branch and
 * per-deployment preview URLs beside it.
 *
 * The alias is less a copy of the site than a second name for it — the same
 * deployment the host above answers from, and before this rule it answered 200
 * with no `X-Robots-Tag` at all. The pages it serves do carry a canonical
 * naming that other host, but a canonical is a hint a crawler may set aside,
 * and the host it names is the one marked above, so there is nothing there for
 * a crawler to prefer these URLs to.
 *
 * The whole `.vercel.app` space rather than the one alias, because the platform
 * mints these names and there is no list of them to keep in step: a new branch
 * is a new host. Nothing the club publishes will ever be served under one.
 *
 * CUTOVER: keep this rule. Unlike the host above it describes no temporary
 * arrangement — the alias goes on pointing at the live deployment once the
 * club's own domain is in front of it, so the duplicate outlives the move.
 */
const DEPLOYMENT_HOSTS = '.*\\.vercel\\.app'

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

/**
 * Only headers no route handler sets for itself belong here.
 *
 * A `Cache-Control` set from this config is overwritten by the one a route
 * handler puts on its own `Response`, which is why the rule that used to keep
 * cache-tagged uploads forever matched every tagged URL and changed nothing —
 * that is applied while wrapping the response now, in
 * `src/app/(payload)/api/media/file/[filename]`. The rules below are safe
 * because nothing downstream claims them: `X-Robots-Tag` is ours alone, and
 * files in `public/` are served by Next rather than by a handler.
 */
const headers = async () => [
  ...[TEMPORARY_HOST, DEPLOYMENT_HOSTS].map((host) => ({
    has: [{ type: 'host', value: host }],
    headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    source: '/:path*',
  })),
  ...PUBLIC_ASSETS.map((source) => ({
    headers: [{ key: 'Cache-Control', value: PUBLIC_ASSET_CACHE_CONTROL }],
    source,
  })),
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
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
