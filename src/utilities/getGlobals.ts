import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cacheLife, cacheTag } from 'next/cache'

type Global = keyof Config['globals']

/**
 * A Payload global, cached under a tag naming it.
 *
 * Only two of the four globals have an `afterChange` hook firing that tag —
 * `header` and `footer` — so those two are visible the moment an editor saves.
 * `general` and `teamDirectory` have no hook, and the window is all they have:
 * hence a short one rather than the month a tag-invalidated reader could afford.
 * `general` carries the content password, and an editor changing it should not
 * be told to wait.
 */
export async function getCachedGlobal<Slug extends Global>(slug: Slug, depth = 0) {
  'use cache'
  cacheLife('listing')
  cacheTag(`global_${slug}`)

  const payload = await getPayload({ config: configPromise })

  return payload.findGlobal({ slug, depth })
}
