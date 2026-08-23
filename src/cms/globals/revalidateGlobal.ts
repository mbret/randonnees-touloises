import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

/**
 * Refreshes whatever the site reads from this global, on the tag `getCachedGlobal`
 * gives it.
 *
 * The header and the footer each had a hook of their own; the other globals had
 * none, so nothing dropped what was cached from them and an editor's save waited
 * on a window — `general` carries the content password, which is not a thing to
 * be told to wait for. This is the same hook, written once, for the globals that
 * are only read rather than also rendered as navigation.
 */
export const revalidateGlobal =
  (slug: string): GlobalAfterChangeHook =>
  ({ doc, req: { payload, context } }) => {
    if (!context.disableRevalidate) {
      payload.logger.info(`Revalidating global: ${slug}`)

      revalidateTag(`global_${slug}`, { expire: 0 })
    }

    return doc
  }
