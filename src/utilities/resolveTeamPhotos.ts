import type { StaticTeamMember } from '@/data/teams'
import type { TeamMember } from '@/components/TeamSection/TeamSection'

import { getMediaByFilenames } from '@/utilities/getMediaByFilenames'

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

  const byFilename = await getMediaByFilenames(filenames)

  return members.map(({ photo, ...member }) => ({
    ...member,
    media: (photo && byFilename.get(photo)) || undefined,
  }))
}
