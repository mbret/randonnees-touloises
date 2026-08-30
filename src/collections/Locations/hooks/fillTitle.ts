import type { CollectionBeforeValidateHook } from 'payload'

import type { Location } from '@/payload-types'

import { locationTitle } from '../locationTitle'

/**
 * The value of a field on the document as it will be after this write.
 *
 * `data` carries only what was submitted, so a partial update has to fall back
 * to the stored document — but a field cleared in the admin arrives as an
 * explicit `null`, which is a value and not an absence. Hence the `in` check
 * rather than `??`: clearing the spot has to shorten the title, and `??` would
 * quietly restore what was just deleted.
 */
const field = <K extends keyof Location>(
  key: K,
  data: Partial<Location>,
  originalDoc?: Location,
): Location[K] | undefined => (key in data ? data[key] : originalDoc?.[key])

/**
 * Keeps `title` in step with the commune and the spot.
 *
 * `title` is a stored column rather than a virtual field because Payload only
 * accepts a virtual one for `useAsTitle` when it comes through a relationship —
 * and `useAsTitle` is the whole point here, since it is what the editor reads
 * in the picker when choosing a start location for an event.
 */
export const fillTitle: CollectionBeforeValidateHook<Location> = ({ data, originalDoc }) => {
  if (!data) return data

  return {
    ...data,
    title: locationTitle({
      commune: field('commune', data, originalDoc),
      spot: field('spot', data, originalDoc),
    }),
  }
}
