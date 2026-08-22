import configPromise from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'

import { SITE_ASSET_FILENAMES } from './siteAssets'

/**
 * The handful of media documents the chrome is built from — the favicon, the
 * logo, the sharing image.
 *
 * The tag names the entry, but nothing fires it: the media collection has no
 * revalidate hook, so the window is what picks up a replaced file. Ten minutes,
 * therefore, rather than the month a tag-invalidated reader could afford — this
 * runs in the root layout, so ten minutes is one small query per ten minutes for
 * the whole site.
 */
export async function getCachedMedias(depth = 0) {
  'use cache'
  cacheLife('listing')
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
