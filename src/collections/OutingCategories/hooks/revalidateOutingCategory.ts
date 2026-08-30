import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { OutingCategory } from '@/payload-types'

/**
 * A category has no page of its own; it surfaces through the events that point
 * at it, and those only appear in the agenda on the home page. So renaming one,
 * or picking its logo, has the same reach as an edit to the event itself, and
 * refreshes the same one path.
 *
 * More pressing here than on its sibling collections, which is why it arrives
 * with the field that draws them: the agenda prints the category's name and its
 * pictogram *now*. Without this, attaching a logo — the one step of the backfill
 * that has to be done by hand — would leave the tile missing from the home page
 * for up to the hour that `revalidate` caches it, with nothing to say why.
 *
 * Unconditional, as on locations: there are no drafts here to rule a write out,
 * and five categories are edited rarely enough that the occasional needless
 * refresh costs less than reasoning about which fields the agenda happens to
 * read.
 */
const revalidateAgenda = (log: (message: string) => void) => {
  log('Revalidating the agenda')

  revalidatePath('/')
}

export const revalidateOutingCategory: CollectionAfterChangeHook<OutingCategory> = ({
  doc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    revalidateAgenda((message) => payload.logger.info(message))
  }

  return doc
}

export const revalidateOutingCategoryDelete: CollectionAfterDeleteHook<OutingCategory> = ({
  doc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    revalidateAgenda((message) => payload.logger.info(message))
  }

  return doc
}
