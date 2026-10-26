// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest'

import { SIGNED_IN_COOKIE } from '@/utilities/signedInCookie'

const auth = vi.fn()
const getPayload = vi.fn(async () => ({ auth }))
const headers = vi.fn()

vi.mock('@payload-config', () => ({ default: { cookiePrefix: 'rt' } }))
vi.mock('payload', () => ({ getPayload }))
vi.mock('next/headers', () => ({ headers }))

const { getSignedInUser } = await import('@/utilities/getSignedInUser')

const mockRequest = (init: HeadersInit) => {
  const requestHeaders = new Headers(init)
  headers.mockResolvedValue(requestHeaders)
  return requestHeaders
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('getSignedInUser', () => {
  it('answers a request carrying only the signed-in hint without starting Payload', async () => {
    mockRequest({ Cookie: `${SIGNED_IN_COOKIE}=1` })

    await expect(getSignedInUser()).resolves.toBeNull()
    expect(getPayload).not.toHaveBeenCalled()
  })

  it('asks Payload for the user behind the token cookie', async () => {
    const user = { id: 1 }
    auth.mockResolvedValue({ user })
    const requestHeaders = mockRequest({
      Cookie: `${SIGNED_IN_COOKIE}=1; rt-token=not-a-real-token`,
    })

    await expect(getSignedInUser()).resolves.toBe(user)
    expect(auth).toHaveBeenCalledWith({ headers: requestHeaders })
  })

  it('asks Payload when the request carries an Authorization header', async () => {
    auth.mockResolvedValue({ user: null })
    const requestHeaders = mockRequest({ Authorization: 'JWT not-a-real-token' })

    await expect(getSignedInUser()).resolves.toBeNull()
    expect(auth).toHaveBeenCalledWith({ headers: requestHeaders })
  })
})
