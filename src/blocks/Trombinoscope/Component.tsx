import type { TrombinoscopeBlock as TrombinoscopeBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { Media } from '@/components/Media'

import { toPortraits, type PortraitAdherent } from './toPortraits'

/**
 * Two portraits to a row on a phone and six from `lg`, in the page container —
 * the grid the coded route drew. Without it the shared `sizes` default asks for
 * ~1080px wide files for a thumbnail that never renders above ~190px.
 */
const IMAGE_SIZES =
  '(min-width: 1024px) 192px, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw'

/**
 * The trombinoscope, read from the adhérents rather than from a list.
 *
 * Fetched with the access check overridden, as `ProfileCardsBlock` is and for
 * the same reason: `adherents` is closed to public reads, so the roster cannot
 * be enumerated, and a page renders for a visitor with no user to check. What
 * may be published is decided by each fiche's own consent, in `toPortraits`.
 *
 * `select` takes the three fields a card needs. The surname is not one of them,
 * so it never reaches the page, not even for the moment it takes to render.
 * The `where` is the same rule as `toPortraits`, applied in the database so the
 * roster's other rows are never read at all; `toPortraits` applies it again to
 * what comes back, which is what its tests hold it to.
 *
 * Faces only, no count above them: a number set under the page's own
 * strapline read as a second strapline, with a block's worth of space
 * between the two. Nothing at all when nobody qualifies, rather than an empty
 * grid holding its place on the page.
 */
export const TrombinoscopeBlock: React.FC<TrombinoscopeBlockProps & { id?: string }> = async () => {
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
      photo: true,
      publicationConsent: true,
    },
    where: {
      and: [{ 'publicationConsent.photo': { equals: true } }, { photo: { exists: true } }],
    },
  })

  const portraits = toPortraits(docs as PortraitAdherent[])

  if (portraits.length === 0) return null

  return (
    <div className="container">
      <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {portraits.map(({ firstName, id, photo }) => (
          <li className="text-center" key={id}>
            <div className="bg-muted aspect-square overflow-hidden rounded-full">
              <Media
                className="w-full h-full"
                imgClassName="w-full h-full object-cover object-center"
                resource={photo}
                size={IMAGE_SIZES}
              />
            </div>
            {firstName && <p className="mt-3 font-medium">{firstName}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
