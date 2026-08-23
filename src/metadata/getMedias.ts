import configPromise from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'

import { SITE_ASSET_FILENAMES } from './siteAssets'

/**
 * The handful of media documents the chrome is built from — the favicon, the
 * logo, the sharing image. Cached under the `medias` tag, which the collection's
 * hook fires on any write, so replacing one of these files shows up on the next
 * request. This runs in the root layout, which is every route in the site, so
 * the tag doing the work rather than a window matters more here than anywhere.
 */
export async function getCachedMedias(depth = 0) {
  'use cache'
  cacheLife('max')
  cacheTag('medias')

  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'media',
    depth,
    pagination: false,
    where: { filename: { in: SITE_ASSET_FILENAMES } },
  })

  return docs
}
