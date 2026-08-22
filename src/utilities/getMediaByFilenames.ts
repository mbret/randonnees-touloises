import type { Media } from '@/payload-types'

import configPromise from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'

/**
 * Look up media documents by filename, keyed for lookup.
 *
 * Filenames rather than ids, because local and production are separate
 * databases with independent id sequences: an id written into src/data would
 * resolve to a different image in each environment. A filename is stable, and a
 * missing one simply yields no entry, which callers render as a placeholder.
 *
 * Cached, because the pages built on it — the trombinoscope, the two team pages —
 * are otherwise entirely static: their names and their order come from
 * `src/data`, and this lookup is the only reason any of them would touch the
 * database. Ten minutes matches the window those pages used to carry themselves,
 * and the tag is the media one, so it lifts with the rest of the site's assets.
 */
export const getMediaByFilenames = async (filenames: string[]): Promise<Map<string, Media>> => {
  'use cache'
  cacheLife('listing')
  cacheTag('medias')

  if (filenames.length === 0) return new Map()

  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    pagination: false,
    where: { filename: { in: filenames } },
  })

  return new Map(docs.flatMap((doc) => (doc.filename ? [[doc.filename, doc] as const] : [])))
}
