import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cacheLife, cacheTag } from 'next/cache'

type Global = keyof Config['globals']

/**
 * A Payload global, cached under a tag naming it, which every one of them fires
 * from its own `afterChange` hook — so an editor's save is visible on the next
 * request rather than at the end of a window. That makes the window a backstop
 * rather than the mechanism, and a long one the right choice.
 */
export async function getCachedGlobal<Slug extends Global>(slug: Slug, depth = 0) {
  'use cache'
  cacheLife('max')
  cacheTag(`global_${slug}`)

  const payload = await getPayload({ config: configPromise })

  return payload.findGlobal({ slug, depth })
}
