// @vitest-environment node

import { describe, expect, it } from 'vitest'

import config from '@/payload.config'

/**
 * `getSignedInUser` answers a request with no token cookie and no `Authorization`
 * header without asking Payload, which is right only while nothing else signs
 * users in.
 */
describe('sign-in strategies', () => {
  it('signs users in only from the token cookie or an Authorization header', async () => {
    const { admin, collections } = await config

    expect(admin.autoLogin).toBeFalsy()
    expect(collections.flatMap(({ auth }) => auth?.strategies ?? [])).toEqual([])
  })
})
