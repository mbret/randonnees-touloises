import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, cleanup, screen, waitFor } from '@testing-library/react'

import { AuthProvider, useAuth } from '@/providers/auth'
import { SIGNED_IN_COOKIE } from '@/utilities/signedInCookie'

const fetchMock = vi.fn()

/* What `CMSLink` and `AdminBar` read: `undefined` while asking, then `null` or a user. */
const Who = () => {
  const { user } = useAuth()
  return <p>{user === undefined ? 'asking' : (user?.email ?? 'nobody')}</p>
}

const renderProvider = () =>
  render(
    <AuthProvider>
      <Who />
    </AuthProvider>,
  )

const meAnswers = (user: object | null) =>
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ user }), { status: 200 }))

const expireCookie = () => {
  document.cookie = `${SIGNED_IN_COOKIE}=; Path=/; Max-Age=0`
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  expireCookie()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  expireCookie()
})

describe('FetchMe', () => {
  it('asks nothing without the signed-in cookie, and settles on nobody', async () => {
    renderProvider()

    await screen.findByText('nobody')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('asks /api/users/me when the cookie says someone may be signed in', async () => {
    document.cookie = `${SIGNED_IN_COOKIE}=1; Path=/`
    meAnswers({ email: 'editrice@example.net', id: 1 })

    renderProvider()

    await screen.findByText('editrice@example.net')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/api\/users\/me$/)
    expect(document.cookie).toContain(`${SIGNED_IN_COOKIE}=1`)
  })

  it('drops a cookie that outlived its token, so the next page asks nothing', async () => {
    document.cookie = `${SIGNED_IN_COOKIE}=1; Path=/`
    meAnswers(null)

    renderProvider()

    await screen.findByText('nobody')
    await waitFor(() => expect(document.cookie).not.toContain(SIGNED_IN_COOKIE))
  })
})
