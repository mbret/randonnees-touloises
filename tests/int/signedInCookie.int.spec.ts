// @vitest-environment node
// `jose` signs the token with a Uint8Array, which jsdom swaps for its own.

import { getPayload, Payload, PayloadRequest } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

import { SIGNED_IN_COOKIE } from '@/utilities/signedInCookie'

let payload: Payload

const email = `signed-in-cookie-${Date.now()}@example.net`
const password = 'not-a-real-password-1'

/** The `Set-Cookie` the hooks left on a request for Payload to send back. */
const signedInCookie = (req: Partial<PayloadRequest>) =>
  req.responseHeaders?.getSetCookie().find((cookie) => cookie.startsWith(`${SIGNED_IN_COOKIE}=`))

describe('payload-signed-in cookie', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await payload.create({ collection: 'users', data: { email, password } })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'users', where: { email: { equals: email } } })
  })

  it('is set on login, readable by the browser, for as long as the token', async () => {
    const req: Partial<PayloadRequest> = {}
    await payload.login({ collection: 'users', data: { email, password }, req })

    const cookie = signedInCookie(req)
    expect(cookie).toMatch(new RegExp(`^${SIGNED_IN_COOKIE}=1;`))
    expect(cookie).toContain('Path=/')
    expect(cookie).toContain('SameSite=Lax')
    expect(cookie).toContain(`Max-Age=${payload.collections.users.config.auth.tokenExpiration}`)
    expect(cookie).not.toMatch(/HttpOnly/i)
  })

  it('is set when a password reset logs the user in', async () => {
    const token = await payload.forgotPassword({
      collection: 'users',
      data: { email },
      disableEmail: true,
    })
    const req: Partial<PayloadRequest> = {}
    await payload.resetPassword({
      collection: 'users',
      data: { password, token },
      overrideAccess: true,
      req,
    })

    expect(signedInCookie(req)).toMatch(new RegExp(`^${SIGNED_IN_COOKIE}=1;`))
  })
})
