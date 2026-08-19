import type { Media } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * Look up media documents by filename, keyed for lookup.
 *
 * Filenames rather than ids, because local and production are separate
 * databases with independent id sequences: an id written into src/data would
 * resolve to a different image in each environment. A filename is stable, and a
 * missing one simply yields no entry, which callers render as a placeholder.
 */
export const getMediaByFilenames = async (filenames: string[]): Promise<Map<string, Media>> => {
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
