import configPromise from '@payload-config'
import { cookies, headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'

/**
 * The signed-in user, or `null`. Payload authenticates only from its token cookie
 * or an `Authorization` header, so a request with neither skips starting Payload,
 * whose database connection would wake Neon.
 */
export const getSignedInUser = async () => {
  const [{ cookiePrefix }, cookieStore, headers] = await Promise.all([
    configPromise,
    cookies(),
    getHeaders(),
  ])

  if (!cookieStore.has(`${cookiePrefix}-token`) && !headers.has('Authorization')) return null

  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  return user
}
