import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

/**
 * Nothing invalidated this global, so an edit to it was picked up only whenever
 * the cached read happened to be dropped. The header and the footer have each
 * had a hook of their own all along; this is the one that was missing.
 *
 * Note what this can and cannot do for `contentPassword`. Whether a password
 * exists decides whether the post pages are prerendered at all, because
 * `WithContentProtectedPassword` reaches for the cookie only once one is set —
 * and a route's rendering mode is fixed at build time. Measured against a
 * production build: a page prerendered while no password was set goes on serving
 * that same HTML after `revalidatePath`, silently and without an error, and only
 * a rebuild turns the route dynamic.
 *
 * So setting or clearing the password needs a deploy to take effect on the post
 * pages, and there is no invalidation call that would change that. Expiring the
 * tag here is still what makes a *replacement* password take effect, since those
 * pages are already being rendered per request by then.
 */
export const revalidateGeneral: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  payload.logger.info('Revalidating the general settings')

  revalidateTag('global_general', { expire: 0 })

  return doc
}
