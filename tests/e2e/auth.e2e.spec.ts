import { test, expect, type APIResponse, type Page } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'
const SIGNED_IN_COOKIE = 'payload-signed-in'

const password = 'not-a-real-password-1'
const newEmail = () => `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.net`

/** Every `/api/users/me` the page asks, from the moment this is called. */
const recordMeRequests = (page: Page) => {
  const urls: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/users/me') urls.push(request.url())
  })
  return urls
}

const setCookies = (response: APIResponse) =>
  response
    .headersArray()
    .filter(({ name }) => name.toLowerCase() === 'set-cookie')
    .map(({ value }) => value)

const signedInCookie = (response: APIResponse) =>
  setCookies(response).find((cookie) => cookie.startsWith(`${SIGNED_IN_COOKIE}=`))

test.describe('Who is signed in', () => {
  let email: string

  test.beforeEach(async ({ request }) => {
    email = newEmail()
    const created = await request.post(`${BASE_URL}/api/users`, { data: { email, password } })
    expect(created.ok()).toBe(true)
  })

  test('an anonymous page load does not ask /api/users/me', async ({ page }) => {
    const me = recordMeRequests(page)

    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')

    expect(me).toEqual([])
    await expect(page.locator('.admin-bar')).toHaveCount(0)
  })

  test('after logging in, the page asks /api/users/me and shows the admin bar', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.getByLabel('Adresse e-mail').fill(email)
    await page.getByLabel('Mot de passe').fill(password)
    await page.getByRole('button', { name: 'Se connecter' }).click()
    await page.waitForURL(/\/account/)

    const me = recordMeRequests(page)
    await page.goto(BASE_URL)

    await expect(page.locator('.admin-bar')).toBeVisible()
    expect(me.length).toBeGreaterThan(0)
  })

  test('login sets the signed-in cookie beside the token, logout expires it', async ({
    request,
  }) => {
    const login = await request.post(`${BASE_URL}/api/users/login`, { data: { email, password } })
    expect(login.ok()).toBe(true)

    expect(setCookies(login).some((cookie) => cookie.startsWith('payload-token='))).toBe(true)
    const signedIn = signedInCookie(login)
    expect(signedIn).toMatch(new RegExp(`^${SIGNED_IN_COOKIE}=1;`))
    expect(signedIn).toMatch(/Max-Age=[1-9]\d*/)
    expect(signedIn).toContain('Path=/')
    expect(signedIn).toContain('SameSite=Lax')
    expect(signedIn).not.toMatch(/HttpOnly/i)

    const refresh = await request.post(`${BASE_URL}/api/users/refresh-token`)
    expect(refresh.ok()).toBe(true)
    expect(signedInCookie(refresh)).toMatch(new RegExp(`^${SIGNED_IN_COOKIE}=1;`))

    const logout = await request.post(`${BASE_URL}/api/users/logout`)
    expect(logout.ok()).toBe(true)
    expect(signedInCookie(logout)).toMatch(new RegExp(`^${SIGNED_IN_COOKIE}=;.*Max-Age=0`))
  })
})
