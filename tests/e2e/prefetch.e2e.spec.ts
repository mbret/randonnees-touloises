import { test, expect, type APIRequestContext, type Page } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

/** Routes a link must never prefetch: each prefetch is a function run for nothing. */
const isNeverPrefetched = (pathname: string) =>
  pathname === '/search' || pathname === '/admin' || pathname.startsWith('/admin/')

/** Every request the page makes to a never-prefetched route, from the moment this is called. */
const recordPrefetches = (page: Page) => {
  const urls: string[] = []
  page.on('request', (request) => {
    if (isNeverPrefetched(new URL(request.url()).pathname)) urls.push(request.url())
  })
  return urls
}

type FooterNavItems = unknown[]

const footerNavItems = async (request: APIRequestContext): Promise<FooterNavItems> => {
  const footer = await request.get(`${BASE_URL}/api/globals/footer?depth=0`)
  expect(footer.ok()).toBe(true)
  return (await footer.json()).navItems ?? []
}

const setFooterNavItems = async (request: APIRequestContext, navItems: FooterNavItems) => {
  const updated = await request.post(`${BASE_URL}/api/globals/footer`, { data: { navItems } })
  expect(updated.ok()).toBe(true)
}

test.describe('Prefetching', () => {
  /* The CI database is empty, so the footer carries no « Admin » link of its own.
   * One is added the way an editor adds it, which is the case the rule in
   * `CMSLink` exists for, and the footer is put back as it was afterwards. */
  let originalNavItems: FooterNavItems

  test.beforeEach(async ({ request }) => {
    const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.net`
    const password = 'not-a-real-password-1'
    expect((await request.post(`${BASE_URL}/api/users`, { data: { email, password } })).ok()).toBe(
      true,
    )
    expect(
      (await request.post(`${BASE_URL}/api/users/login`, { data: { email, password } })).ok(),
    ).toBe(true)

    originalNavItems = await footerNavItems(request)
    await setFooterNavItems(request, [
      ...originalNavItems,
      { link: { type: 'custom', url: '/admin', label: 'Admin' } },
    ])
  })

  test.afterEach(async ({ request }) => {
    await setFooterNavItems(request, originalNavItems)
  })

  test('a page load, scrolled to the bottom, prefetches neither /admin nor /search', async ({
    page,
  }) => {
    const prefetches = recordPrefetches(page)

    await page.goto(BASE_URL)

    /* Both links on screen, or the test could pass by never showing them. */
    await expect(page.getByRole('banner').getByRole('link', { name: 'Recherche' })).toBeVisible()
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    const admin = page.getByRole('contentinfo').getByRole('link', { name: 'Admin' })
    await expect(admin).toBeInViewport()
    await expect(admin).toHaveAttribute('href', '/admin')

    await page.waitForLoadState('networkidle')

    expect(prefetches).toEqual([])
  })
})
