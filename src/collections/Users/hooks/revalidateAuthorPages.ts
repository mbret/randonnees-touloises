import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeDeleteHook,
} from 'payload'

import { pathsShowingPosts, refreshPostPages } from '@/collections/Posts/hooks/revalidatePost'

import type { User } from '@/payload-types'

/**
 * A post prints its authors' names, on its own page and on its card, and reads
 * them off the user at render time (`populateAuthors`). So renaming a user
 * changes those pages without anyone saving the post, and they have no timer
 * behind them to catch it.
 *
 * Only the name: it is all a page shows of a user. Logging in writes to the
 * user too, and must not refresh anything.
 */
const byAuthor = (id: number | string) => ({ authors: { equals: id } })

export const revalidateAuthorPages: CollectionAfterChangeHook<User> = async ({
  doc,
  operation,
  previousDoc,
  req,
}) => {
  if (!req.context.disableRevalidate && operation === 'update' && doc.name !== previousDoc?.name) {
    refreshPostPages(req, await pathsShowingPosts(req, byAuthor(doc.id)))
  }

  return doc
}

/** Where `noteAuthorPagesBeforeDelete` leaves word for the delete. */
const AUTHOR_PAGES_BEING_DELETED = 'authorPagesBeingDeleted'

/**
 * Asked before the delete: the database drops the author rows with the user,
 * so afterwards no post can be found by them, and the pages would go on
 * printing the name of someone who is no longer there.
 */
export const noteAuthorPagesBeforeDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  if (req.context.disableRevalidate) return

  const noted = (req.context[AUTHOR_PAGES_BEING_DELETED] ??= []) as string[]

  noted.push(...(await pathsShowingPosts(req, byAuthor(id))))
}

export const revalidateAuthorPagesDelete: CollectionAfterDeleteHook<User> = ({ doc, req }) => {
  if (!req.context.disableRevalidate) {
    refreshPostPages(req, (req.context[AUTHOR_PAGES_BEING_DELETED] as string[]) ?? [])
  }

  return doc
}
