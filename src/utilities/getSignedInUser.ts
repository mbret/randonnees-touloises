import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import { parseCookies } from 'payload/shared'

/**
 * Users sign in only through Payload's local strategy, which reads its token
 * cookie or an `Authorization` header. A request with neither skips starting
 * Payload, whose database connection would wake Neon.
 */
export const getSignedInUser = async () => {
  const [{ cookiePrefix }, headers] = await Promise.all([configPromise, getHeaders()])

  if (!parseCookies(headers).has(`${cookiePrefix}-token`) && !headers.has('Authorization')) {
    return null
  }

  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  return user
}
