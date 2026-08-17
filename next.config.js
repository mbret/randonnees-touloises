import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
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
