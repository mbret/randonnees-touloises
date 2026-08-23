import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cacheLife, cacheTag } from 'next/cache'

type Collection = keyof Config['collections']

/**
 * One document by slug, cached under a tag naming that exact document.
 *
 * Nothing fires that tag — the hooks revalidate by path, and Next drops what
 * such a render touched, this entry included. So the tag is here to name the
 * entry rather than because anything uses it, and the window is deliberately
 * short: this resolves where a redirect points, and a redirect aimed at a
 * renamed document should not go on pointing at the old one for a month.
 */
export async function getCachedDocument(collection: Collection, slug: string, depth = 0) {
  'use cache'
  cacheLife('listing')
  cacheTag(`${collection}_${slug}`)

  const payload = await getPayload({ config: configPromise })

  const page = await payload.find({
    collection,
    depth,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return page.docs[0]
}
