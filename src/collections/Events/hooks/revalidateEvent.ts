import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Event } from '../../../payload-types'

/**
 * Events have no page of their own; they only ever surface in the agenda on the
 * home page. So a write revalidates that, rather than a per-document path — it
 * is otherwise only re-rendered on a timer, which would leave a freshly
 * published event invisible for up to an hour.
 */
const revalidateAgenda = (log: (message: string) => void) => {
  log('Revalidating the agenda')

  revalidatePath('/')
}

/**
 * Whether this write can have changed what the agenda shows.
 *
 * The collection's `read` access answers anyone who is not an admin with
 * `_status: published`, and `getAgendaEvents` queries with `overrideAccess:
 * false` — so a draft is not on the home page and cannot have moved it. Writing
 * one used to refresh the agenda anyway, and refreshing it is not free: the
 * entry is dropped rather than expired, so the next visitor waits for the whole
 * page to be rendered again rather than being served the copy that was already
 * there.
 *
 * A write that leaves a published version behind still counts, which is what
 * `previousDoc` is for: unpublishing has to take the event off the page.
 */
const affectsAgenda = (doc: Event, previousDoc?: Event) =>
  doc._status === 'published' || previousDoc?._status === 'published'

export const revalidateEvent: CollectionAfterChangeHook<Event> = ({
  doc,
  previousDoc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate && affectsAgenda(doc, previousDoc)) {
    revalidateAgenda((message) => payload.logger.info(message))
  }

  return doc
}

/**
 * Unconditional, as in the sibling collections: a delete is rare enough that
 * one refresh costs nothing, and there is no second state to compare against to
 * be sure the document was only ever a draft.
 */
export const revalidateEventDelete: CollectionAfterDeleteHook<Event> = ({
  doc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    revalidateAgenda((message) => payload.logger.info(message))
  }

  return doc
}
