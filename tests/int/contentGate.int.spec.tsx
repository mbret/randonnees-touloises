import { describe, it, expect, vi, beforeEach } from 'vitest'

/** Stands in for whatever the editor typed into the global. Not a credential. */
const CONFIGURED = 'gate-fixture-value'

const cookieGet = vi.fn()
const cookies = vi.fn(async () => ({ get: cookieGet }))
let configured: string | undefined

vi.mock('next/headers', () => ({ cookies: () => cookies() }))
vi.mock('@/utilities/getGlobals', () => ({
  getCachedGlobal: () => async () => ({ contentPassword: configured }),
}))

const { WithContentProtectedPassword } = await import(
  '@/components/auth/WithContentProtectedPassword'
)

const CHILDREN = <p>the protected body</p>

const gate = (required: boolean | null | undefined) =>
  WithContentProtectedPassword({ children: CHILDREN, required })

beforeEach(() => {
  cookies.mockClear()
  cookieGet.mockReset()
  configured = undefined
})

describe('WithContentProtectedPassword', () => {
  describe('with nothing configured on the global', () => {
    it('passes through without reading the cookie, so the page can be prerendered', async () => {
      expect(await gate(true)).toBe(CHILDREN)
      expect(cookies).not.toHaveBeenCalled()
    })

    it('passes an ungated post through too', async () => {
      expect(await gate(false)).toBe(CHILDREN)
      expect(cookies).not.toHaveBeenCalled()
    })
  })

  describe('with a password configured', () => {
    beforeEach(() => {
      configured = CONFIGURED
    })

    it('reads the cookie even for an ungated post, so the rendering mode does not depend on the checkbox', async () => {
      expect(await gate(false)).toBe(CHILDREN)
      // Were this skipped, ticking the box on an already-prerendered post would
      // ask a static route to turn dynamic, which it cannot.
      expect(cookies).toHaveBeenCalled()
    })

    it('withholds the body when the cookie is missing', async () => {
      cookieGet.mockReturnValue(undefined)

      expect(await gate(true)).not.toBe(CHILDREN)
    })

    it('withholds the body when the cookie does not match', async () => {
      cookieGet.mockReturnValue({ value: 'something-else' })

      expect(await gate(true)).not.toBe(CHILDREN)
    })

    it('serves the body when the cookie matches', async () => {
      cookieGet.mockReturnValue({ value: CONFIGURED })

      expect(await gate(true)).toBe(CHILDREN)
    })
  })
})
