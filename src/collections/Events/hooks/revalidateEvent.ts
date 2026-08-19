import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Event } from '../../../payload-types'

/**
 * Events have no page of their own; they only ever surface in the agenda on the
 * home page. So every write revalidates that, rather than a per-document path —
 * it is otherwise only re-rendered on a timer, which would leave a freshly
 * published event invisible for up to an hour.
 */
const revalidateAgenda = (log: (message: string) => void) => {
  log('Revalidating the agenda')

  revalidatePath('/')
}

export const revalidateEvent: CollectionAfterChangeHook<Event> = ({
  doc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    revalidateAgenda((message) => payload.logger.info(message))
  }

  return doc
}

export const revalidateEventDelete: CollectionAfterDeleteHook<Event> = ({
  doc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    revalidateAgenda((message) => payload.logger.info(message))
  }

  return doc
}
