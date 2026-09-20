import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'
import { THUMBNAIL_REMOTE_PATTERNS } from './src/blocks/MediaLinks/thumbnailHosts.js'

/**
 * The addresses Vercel gives a deployment of its own accord: the project's
 * production alias, `randonnees-touloises.vercel.app`, and the per-branch and
 * per-deployment preview URLs beside it.
 *
 * The alias is less a copy of the site than a second name for it — the same
 * deployment the club's own domain answers from, and before this rule it
 * answered 200 with no `X-Robots-Tag` at all. Its pages do carry a canonical,
 * and now that the club's domain is the one it names, a crawler that honours
 * the canonical already prefers the real address. The mark is for the one that
 * does not: a canonical is a hint a crawler may set aside.
 *
 * The whole `.vercel.app` space rather than the one alias, because the platform
 * mints these names and there is no list of them to keep in step: a new branch
 * is a new host. Nothing the club publishes will ever be served under one.
 *
 * The alias goes on pointing at the live deployment now that the club's own
 * domain is in front of it, so this duplicate outlived the cutover and the rule
 * stays with it.
 */
const DEPLOYMENT_HOSTS = '.*\\.vercel\\.app' // `has.value` is an anchored regex

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
  {
    has: [{ type: 'host', value: DEPLOYMENT_HOSTS }],
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
    /**
     * The widths a transformation may be asked for, and so — multiplied by the
     * formats browsers accept — what one upload can cost per month.
     *
     * Next's defaults offer fifteen: eight device widths up to 3840 and seven
     * image widths down to 32. Nothing the club publishes needs a 4K variant,
     * and no two adjacent widths in that list are far enough apart to be worth
     * a separate stored copy. These four cover a phone, a tablet, a laptop and
     * a desktop; `imageSizes` covers the small fixed elements, the ~40px outing
     * logos and the 192px portraits, at 1x and 2x.
     *
     * `imageSizes` entries have to stay below the smallest `deviceSizes` entry,
     * which is what the two lists mean: one is consulted for images declared
     * smaller than the screen, the other for images measured against it.
     */
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [48, 96, 192, 384],
    /**
     * One quality, so a width is stored once rather than once per quality.
     *
     * This listed 100 as well, for an `ImageMedia` that asked for it. At that
     * setting the optimiser has almost nothing left to remove — one photo came
     * back the same size it went in, across nine transformations — so the
     * second copy of every width bought nothing. 75 is Next's default and the
     * value the portraits already asked for.
     *
     * Next coerces an unlisted quality to the nearest listed one and warns, so
     * a caller passing anything else now gets 75 and a line in the log.
     */
    qualities: [75],
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
