import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateTag } from 'next/cache'

/**
 * The redirects are read through a single cached query tagged 'redirects', so
 * every write to the collection has to drop that tag — deletions included,
 * otherwise a removed redirect keeps being served until the next deploy.
 */
export const revalidateRedirects: CollectionAfterChangeHook = ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating redirects`)

  revalidateTag('redirects', { expire: 0 })

  return doc
}

export const revalidateRedirectsDelete: CollectionAfterDeleteHook = ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating redirects after delete`)

  revalidateTag('redirects', { expire: 0 })

  return doc
}
