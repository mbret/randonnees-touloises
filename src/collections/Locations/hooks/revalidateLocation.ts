import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Location } from '@/payload-types'

/**
 * A start location has no page of its own; it surfaces through the events that
 * point at it, and those only appear in the agenda on the home page. So a
 * correction to an address or a pin has the same reach as an edit to the event
 * itself, and refreshes the same one path.
 *
 * Unconditional, unlike the events hook: there are no drafts here to rule a
 * write out, and a location is edited rarely enough that the occasional
 * needless refresh costs less than reasoning about which fields the agenda
 * happens to read.
 */
const revalidateAgenda = (log: (message: string) => void) => {
  log('Revalidating the agenda')

  revalidatePath('/')
}

export const revalidateLocation: CollectionAfterChangeHook<Location> = ({
  doc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    revalidateAgenda((message) => payload.logger.info(message))
  }

  return doc
}

export const revalidateLocationDelete: CollectionAfterDeleteHook<Location> = ({
  doc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    revalidateAgenda((message) => payload.logger.info(message))
  }

  return doc
}
