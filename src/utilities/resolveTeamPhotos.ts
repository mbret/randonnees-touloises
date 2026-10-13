import type { StaticTeamMember } from '@/data/teams'
import type { TeamMember } from '@/components/TeamSection/TeamSection'
import type { Media } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * A name down to its letters, so this list and a fiche agree however each one
 * typed it: « Gérald » and « Gerald », « Jean-luc » and « Jean-Luc »,
 * « FRANÇOIS » and « FRANCOIS ».
 */
const nameKey = (name: string) =>
  name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')

/**
 * Give each member the portrait on their adhérent fiche, by the rule /board and
 * /trombinoscope apply: the fiche's « Portrait », and only with « Portrait »
 * ticked under « Publication sur le site ». A portrait changed on a fiche
 * reaches this page the way it reaches those, and so does a permission
 * withdrawn.
 *
 * The fiche is found by name, the one thing a member listed in code shares with
 * it: ids are per-database sequences. Without a portrait it may show, a member
 * is drawn with their initials — and so is one whose name no fiche carries, or
 * two do, since then there is no saying whose face it is.
 *
 * Read with the access check overridden, as the blocks read: `adherents` is
 * closed to public reads, and what may be published is the consent on each
 * fiche, not who is asking. The `where` leaves the fiches with nothing to show
 * in the database, and the consent is checked again on what comes back, as
 * `toPortraits` does. `select` takes the four fields the match and that rule
 * need, so no telephone or address is read along with them.
 */
export const resolveTeamPhotos = async (members: StaticTeamMember[]): Promise<TeamMember[]> => {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'adherents',
    // Enough to populate the portrait, not enough to follow anything further.
    depth: 1,
    limit: 0,
    overrideAccess: true,
    pagination: false,
    select: { firstName: true, lastName: true, photo: true, publicationConsent: true },
    where: {
      and: [{ 'publicationConsent.photo': { equals: true } }, { photo: { exists: true } }],
    },
  })

  /** `null` marks a name two fiches answer to. */
  const portraits = new Map<string, Media | null>()

  for (const { firstName, lastName, photo, publicationConsent } of docs) {
    // An unpopulated relationship arrives as an id, a deleted file as null.
    if (!publicationConsent?.photo || !photo || typeof photo !== 'object') continue

    const key = nameKey(`${firstName ?? ''}${lastName ?? ''}`)

    portraits.set(key, portraits.has(key) ? null : photo)
  }

  return members.map(({ ficheName, ...member }) => ({
    ...member,
    media: portraits.get(nameKey(ficheName ?? member.name ?? '')) ?? undefined,
  }))
}
