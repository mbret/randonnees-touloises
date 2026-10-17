import { existsSync } from 'node:fs'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const revalidatePath = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  revalidateTag: vi.fn(),
}))

const { GET } = await import('@/app/(frontend)/next/daily-refresh/route')
const { DAILY_PATHS } = await import('@/utilities/dailyRefresh')

const SECRET = 'test-cron-secret'

/** The request Vercel's cron sends, with whatever `Authorization` it is given. */
const cron = (authorization?: string) =>
  GET(
    new Request('https://randonnees-touloises.net/next/daily-refresh', {
      headers: authorization ? { authorization } : {},
    }),
  )

beforeEach(() => {
  revalidatePath.mockClear()
  vi.stubEnv('CRON_SECRET', SECRET)
  /* 00:20 UTC, when the cron fires: already 02:20 the next day in Toul. */
  vi.useFakeTimers({ now: new Date('2026-10-17T00:20:00Z'), toFake: ['Date'] })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe('the daily refresh', () => {
  it('refreshes the pages that work something out from the date', async () => {
    const response = await cron(`Bearer ${SECRET}`)

    expect(response.status).toBe(200)
    expect(revalidatePath.mock.calls).toEqual([
      ['/', undefined],
      ['/programs', undefined],
      ['/(frontend)/programs/[slug]', 'page'],
    ])
  })

  /*
   * Only those: anything else refreshed would be re-rendered for its next
   * visitor and come out the same. The whole site, the footer's year with it,
   * is the first of January's alone.
   */
  it('leaves the rest of the site alone on an ordinary day', async () => {
    await cron(`Bearer ${SECRET}`)

    expect(revalidatePath).not.toHaveBeenCalledWith('/', 'layout')
    expect(revalidatePath).not.toHaveBeenCalledWith('/sitemap.xml', undefined)
  })

  it('refreshes the whole site on the first of January, for the footer’s year', async () => {
    vi.setSystemTime(new Date('2027-01-01T00:20:00Z'))

    const response = await cron(`Bearer ${SECRET}`)

    expect(await response.json()).toMatchObject({ today: '2027-01-01' })
    expect(revalidatePath.mock.calls).toEqual([['/', 'layout']])
  })

  /*
   * The day is Toul's, not the server's: at 23:30 UTC on the 31st it is
   * already the new year in Toul.
   */
  it('goes by the day in Toul', async () => {
    vi.setSystemTime(new Date('2026-12-31T23:30:00Z'))

    await cron(`Bearer ${SECRET}`)

    expect(revalidatePath.mock.calls).toEqual([['/', 'layout']])
  })

  it('rejects a request without the secret', async () => {
    const response = await cron()

    expect(response.status).toBe(401)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('rejects a request with the wrong secret', async () => {
    const response = await cron('Bearer guessed')

    expect(response.status).toBe(401)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  /* An unset secret used to make the expected header `Bearer undefined`. */
  it('rejects everyone when no secret is configured', async () => {
    vi.stubEnv('CRON_SECRET', '')

    expect((await cron('Bearer undefined')).status).toBe(401)
    expect((await cron('Bearer ')).status).toBe(401)
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  /*
   * A pattern that names no route file refreshes nothing and says nothing
   * about it, so a renamed or moved file would quietly end the refresh.
   */
  it('names route files that exist', () => {
    for (const [route, type] of DAILY_PATHS) {
      if (!type) continue

      expect(existsSync(path.join('src/app', route, 'page.tsx')), route).toBe(true)
    }
  })
})
