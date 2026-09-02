import type { CollectionBeforeValidateHook } from 'payload'

import type { Adherent } from '@/payload-types'

import { adherentName } from '../adherentName'

/**
 * The value of a field on the document as it will be after this write.
 *
 * `data` carries only what was submitted, so a partial update has to fall back
 * to the stored document — but a field cleared in the admin arrives as an
 * explicit `null`, which is a value and not an absence. Hence the `in` check
 * rather than `??`: clearing a first name has to shorten the name, and `??`
 * would quietly restore what was just deleted.
 *
 * Lifted from `Locations`' `fillTitle`, which needs the same thing for the same
 * reason.
 */
const field = <K extends keyof Adherent>(
  key: K,
  data: Partial<Adherent>,
  originalDoc?: Adherent,
): Adherent[K] | undefined => (key in data ? data[key] : originalDoc?.[key])

/**
 * Keeps `fullName` in step with the surname and the first name.
 *
 * Stored rather than virtual because Payload only accepts a virtual field for
 * `useAsTitle` when it arrives through a relationship — and `useAsTitle` is the
 * whole point, since it is what an admin reads when picking a household, or
 * scanning a list of several hundred people for one of the seven Bernards.
 */
export const fillFullName: CollectionBeforeValidateHook<Adherent> = ({ data, originalDoc }) => {
  if (!data) return data

  return {
    ...data,
    fullName: adherentName({
      firstName: field('firstName', data, originalDoc),
      lastName: field('lastName', data, originalDoc),
    }),
  }
}
