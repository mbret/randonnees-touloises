import type { ProfileCardsBlock as ProfileCardsBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { TeamSection } from '@/components/TeamSection/TeamSection'

import { toTeamMember, type PublishableAdherent } from './toTeamMember'

/**
 * A list of adhérents as profile cards.
 *
 * The adhérents are fetched here rather than read off the relationship, which
 * looks redundant and is not. `adherents` is closed to public reads — that is
 * what keeps the roster from being enumerable — and a page renders for a
 * visitor with `overrideAccess: false`, so Payload populates the relationship
 * with nothing and the block would draw an empty grid. The ids still arrive, so
 * this fetches them itself with the access check overridden, having no user to
 * check: the decision about what may be published is the two consents on each
 * document, not who is asking.
 *
 * `select` narrows that to the six fields a card can use. The rest of an
 * adhérent — the address, the date of birth, the licence — has no business in a
 * page's payload even for the moment it takes to render.
 */
export const ProfileCardsBlock: React.FC<ProfileCardsBlockProps & { id?: string }> = async ({
  members,
}) => {
  const ids = (members ?? [])
    .map((member) => (typeof member === 'object' ? member.id : member))
    .filter((id): id is number => typeof id === 'number')

  if (ids.length === 0) return null

  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'adherents',
    // Enough to populate the portrait, not enough to follow anything further.
    depth: 1,
    limit: ids.length,
    overrideAccess: true,
    pagination: false,
    select: {
      boardRole: true,
      firstName: true,
      lastName: true,
      phone: true,
      photo: true,
      publicationConsent: true,
    },
    where: { id: { in: ids } },
  })

  /**
   * Back into the order the editor arranged. `where id in` answers in whatever
   * order the database finds them, and the order of this list is the whole point
   * of the block — the conseil is not read alphabetically.
   */
  const byId = new Map(docs.map((doc) => [doc.id, doc]))
  const ordered = ids
    .map((id) => byId.get(id))
    .filter((doc): doc is NonNullable<typeof doc> => Boolean(doc))

  if (ordered.length === 0) return null

  return (
    <div className="container">
      <TeamSection teamMembers={ordered.map((doc) => toTeamMember(doc as PublishableAdherent))} />
    </div>
  )
}
