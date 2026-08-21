import { describe, it, expect, vi, beforeEach } from 'vitest'

const cookieGet = vi.fn()
const cookies = vi.fn(async () => ({ get: cookieGet }))
let contentPassword: string | undefined

vi.mock('next/headers', () => ({ cookies: () => cookies() }))
vi.mock('@/utilities/getGlobals', () => ({
  getCachedGlobal: () => async () => ({ contentPassword }),
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
  contentPassword = undefined
})

describe('WithContentProtectedPassword', () => {
  it('passes an ungated post straight through, without reading the cookie', async () => {
    contentPassword = 'letmein'

    expect(await gate(false)).toBe(CHILDREN)
    // The point of the ordering: a cookie read here would opt the whole route
    // into being rendered per request, so an ungated post must not reach it.
    expect(cookies).not.toHaveBeenCalled()
  })

  it('passes through when no password is configured, without reading the cookie', async () => {
    contentPassword = undefined

    expect(await gate(true)).toBe(CHILDREN)
    expect(cookies).not.toHaveBeenCalled()
  })

  it('withholds the body when the cookie is missing', async () => {
    contentPassword = 'letmein'
    cookieGet.mockReturnValue(undefined)

    expect(await gate(true)).not.toBe(CHILDREN)
    expect(cookies).toHaveBeenCalled()
  })

  it('withholds the body when the cookie does not match', async () => {
    contentPassword = 'letmein'
    cookieGet.mockReturnValue({ value: 'wrong' })

    expect(await gate(true)).not.toBe(CHILDREN)
  })

  it('serves the body when the cookie matches', async () => {
    contentPassword = 'letmein'
    cookieGet.mockReturnValue({ value: 'letmein' })

    expect(await gate(true)).toBe(CHILDREN)
  })
})
