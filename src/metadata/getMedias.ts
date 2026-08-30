import configPromise from '@payload-config'
import { SITE_ASSET_FILENAMES } from './siteAssets'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

async function getMedias(depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'media',
    depth,
    pagination: false,
    where: { filename: { in: SITE_ASSET_FILENAMES } },
  })

  return docs
}

/**
 * Returns a unstable_cache function mapped with the cache tag for the slug
 */
export const getCachedMedias = (depth = 0) =>
  unstable_cache(async () => getMedias(depth), ['medias'], {
    tags: [`medias`],
  })
