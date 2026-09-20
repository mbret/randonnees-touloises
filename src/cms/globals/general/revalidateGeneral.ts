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
 *
 * Known, and deliberately left: the password half of that is the one thing this
 * makes newly reachable, and it is the half that cannot work. A post built while
 * no password was set was prerendered without ever calling `cookies()`, and a
 * route cannot turn dynamic at runtime — so the regeneration this triggers hits
 * the `cookies()` call at `WithContentProtectedPassword.tsx` in a static render.
 * Before this hook existed nothing expired `global_general` at all, so setting a
 * password reached those pages only on the next deploy, which rebuilds and
 * settles the route mode correctly.
 *
 * Not worked around here, because the workaround would be a hook that asks which
 * field changed before expiring its own global's tag, and the thing it would be
 * propping up is a soft lock that already carries a TODO to be redone on the
 * server. Checking the password there, with a signed cookie, is what removes the
 * static-or-dynamic question at the root; until then a password change still
 * lands on the next deploy, as it always did. See the note on
 * `WithContentProtectedPassword`.
 */
export const revalidateGeneral: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating general settings`)

    revalidateTag('global_general', { expire: 0 })
  }

  return doc
}
