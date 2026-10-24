// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest'

const auth = vi.fn()
const getPayload = vi.fn(async () => ({ auth }))
const cookies = vi.fn()
const headers = vi.fn()

vi.mock('@payload-config', () => ({ default: { cookiePrefix: 'payload' } }))
vi.mock('payload', () => ({ getPayload }))
vi.mock('next/headers', () => ({ cookies, headers }))

const { getSignedInUser } = await import('@/utilities/getSignedInUser')

/** Answers `cookies()` and `headers()` as they would be for a request carrying these. */
const request = ({
  cookieNames = [],
  headerValues = {},
}: {
  cookieNames?: string[]
  headerValues?: Record<string, string>
}) => {
  cookies.mockResolvedValue({ has: (name: string) => cookieNames.includes(name) })
  headers.mockResolvedValue(new Headers(headerValues))
}

afterEach(() => {
  vi.clearAllMocks()
})

describe('getSignedInUser', () => {
  it('answers a request with no credentials without starting Payload', async () => {
    request({ cookieNames: ['payload-signed-in'] })

    await expect(getSignedInUser()).resolves.toBeNull()
    expect(getPayload).not.toHaveBeenCalled()
  })

  it('asks Payload for the user behind the token cookie', async () => {
    const user = { id: 1 }
    auth.mockResolvedValue({ user })
    request({ cookieNames: ['payload-token'] })

    await expect(getSignedInUser()).resolves.toBe(user)
    expect(auth).toHaveBeenCalledOnce()
  })

  it('asks Payload when the request carries an Authorization header', async () => {
    auth.mockResolvedValue({ user: null })
    request({ headerValues: { Authorization: 'JWT not-a-real-token' } })

    await expect(getSignedInUser()).resolves.toBeNull()
    expect(getPayload).toHaveBeenCalledOnce()
  })
})
