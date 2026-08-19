import type { StaticTeamMember } from '@/data/teams'
import type { TeamMember } from '@/components/TeamSection/TeamSection'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * Turn the filename each static member carries into the media document
 * TeamSection renders. Filenames rather than ids, because local and production
 * are separate databases with independent id sequences — an id baked into
 * src/data/teams.ts would point at a different portrait in each environment.
 *
 * Members whose file is missing keep no media and fall back to their initials.
 */
export const resolveTeamPhotos = async (members: StaticTeamMember[]): Promise<TeamMember[]> => {
  const filenames = members
    .map(({ photo }) => photo)
    .filter((photo): photo is string => Boolean(photo))

  if (filenames.length === 0) return members.map(({ photo: _photo, ...member }) => member)

  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    pagination: false,
    where: { filename: { in: filenames } },
  })

  const byFilename = new Map(docs.map((doc) => [doc.filename, doc]))

  return members.map(({ photo, ...member }) => ({
    ...member,
    media: (photo && byFilename.get(photo)) || undefined,
  }))
}
