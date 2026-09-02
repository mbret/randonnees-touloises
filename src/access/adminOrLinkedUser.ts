import type { Access } from 'payload'

import { checkRole } from '@/access/utilities'

/**
 * The document names the requesting user in its `user` field, or the user is an
 * admin.
 *
 * `adminOrSelf` matches a user's own row by `id`, which is what an auth
 * collection needs. An adhérent is a different document that *points at* a user,
 * so the constraint belongs on `user` instead.
 *
 * An adhérent with no `user` therefore matches nobody, which is the point rather
 * than a gap: most of the roster never logs in, and those rows stay visible to
 * admins alone.
 */
export const adminOrLinkedUser: Access = ({ req: { user } }) => {
  if (!user) return false

  if (checkRole(['admin'], user)) return true

  return {
    user: {
      equals: user.id,
    },
  }
}
