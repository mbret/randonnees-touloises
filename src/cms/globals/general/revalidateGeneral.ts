import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

/**
 * The home page's hero photograph and the content password both come from this
 * global, and both are read through `getCachedGlobal` — so without this hook a
 * change waits for whatever `revalidate` the page it appears on happens to
 * carry: an hour for the home page, and for the gated posts nothing short of a
 * deploy.
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
