import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

async function getMedias(depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'media',
    depth,
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
