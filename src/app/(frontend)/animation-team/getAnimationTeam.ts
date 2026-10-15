import type { TeamMember } from '@/components/TeamSection/TeamSection'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { toTeamMember, type PublishableAdherent } from '@/blocks/ProfileCards/toTeamMember'

const collator = new Intl.Collator('fr', { sensitivity: 'base' })

/**
 * The équipe d'animation as the adhérents record it: everyone with « Animateur
 * ou animatrice » ticked on their fiche, so who leads the walks is changed in
 * the admin rather than in the code.
 *
 * Each card is drawn by `toTeamMember`, as the conseil's are: the name the
 * fiche carries, the portrait only with « Portrait » ticked under « Publication
 * sur le site », the telephone only with « Téléphone ». The conseil's function
 * is not selected, so no card prints one — being trésorier says nothing about
 * leading a walk.
 *
 * Read with the access check overridden, as the blocks read: `adherents` is
 * closed to public reads, and what may be published is the consent on each
 * fiche, not who is asking. `select` takes what a card can show and nothing
 * more — no address, no date of birth, no licence.
 *
 * By surname, then first name, the order the previous site listed them in,
 * compared the way French reads. The id settles two fiches of the same name, so
 * the order holds from one render to the next.
 */
export const getAnimationTeam = async (): Promise<TeamMember[]> => {
  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'adherents',
    // Enough to populate the portrait, not enough to follow anything further.
    depth: 1,
    limit: 0,
    overrideAccess: true,
    pagination: false,
    select: {
      firstName: true,
      lastName: true,
      phone: true,
      photo: true,
      publicationConsent: true,
    },
    where: { isAnimateur: { equals: true } },
  })

  return docs
    .sort(
      (a, b) =>
        collator.compare(a.lastName ?? '', b.lastName ?? '') ||
        collator.compare(a.firstName ?? '', b.firstName ?? '') ||
        a.id - b.id,
    )
    .map((doc) => toTeamMember(doc as PublishableAdherent))
}
