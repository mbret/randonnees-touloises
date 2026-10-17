import type { CollectionAfterLogoutHook, PayloadRequest, SanitizedCollectionConfig } from 'payload'

import { SIGNED_IN_COOKIE } from '@/utilities/signedInCookie'

/**
 * Keep `payload-signed-in` in step with `payload-token`, so the front end knows
 * when asking `/api/users/me` is worth a function call.
 *
 * Written to `req.responseHeaders`, which Payload appends to its REST responses
 * after the endpoint's own headers, so the token's `Set-Cookie` survives beside
 * this one. The admin panel logs in, refreshes and logs out through the same
 * endpoints, and reset password and first-user registration log in through
 * `afterLogin`, so those are covered without hooks of their own.
 */
const appendCookie = (req: PayloadRequest, value: string, maxAge: number) => {
  const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const secure = forwardedProto ? forwardedProto === 'https' : req.url?.startsWith('https:')

  req.responseHeaders = req.responseHeaders ?? new Headers()
  req.responseHeaders.append(
    'Set-Cookie',
    [
      `${SIGNED_IN_COOKIE}=${value}`,
      'Path=/',
      `Max-Age=${maxAge}`,
      'SameSite=Lax',
      ...(secure ? ['Secure'] : []),
    ].join('; '),
  )
}

/* Both `afterLogin` and `afterRefresh`: lives exactly as long as the token. */
export const setSignedInCookie = ({
  collection,
  req,
}: {
  collection: SanitizedCollectionConfig
  req: PayloadRequest
}) => {
  appendCookie(req, '1', collection.auth.tokenExpiration)
}

export const expireSignedInCookie: CollectionAfterLogoutHook = ({ req }) => {
  appendCookie(req, '', 0)
}
