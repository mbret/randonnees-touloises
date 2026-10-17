import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

/**
 * The home page's hero photograph comes from this global, and is read through
 * `getCachedGlobal` — so without this hook a change waits for the hour the home
 * page's `revalidate` carries.
 *
 * Expiring the tag reaches the rendered pages as well as the cached read: the
 * routes that called the cached function inherit its tag, so the hero is
 * repainted with the new photograph rather than serving the old one until the
 * next revalidation.
 */
export const revalidateGeneral: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating general settings`)

    revalidateTag('global_general', { expire: 0 })
  }

  return doc
}
