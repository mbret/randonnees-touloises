/**
 * A cookie the browser can read, set beside Payload's HttpOnly `payload-token`,
 * that says "this visitor may be signed in".
 *
 * `FetchMe` asks `/api/users/me` only when it is present. That request can't be
 * cached, so without this every page view by every visitor ran a function,
 * often a cold one booting all of Payload, to learn what is `null` for all but
 * a handful of editors. The cookie carries no identity and grants nothing: the
 * token stays the only proof, and `/api/users/me` the only answer.
 */
export const SIGNED_IN_COOKIE = 'payload-signed-in'

export const hasSignedInCookie = () =>
  document.cookie.split(';').some((cookie) => cookie.trim().startsWith(`${SIGNED_IN_COOKIE}=`))

/* For a cookie that outlived its token: `/api/users/me` answered no user. */
export const clearSignedInCookie = () => {
  document.cookie = `${SIGNED_IN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
}
