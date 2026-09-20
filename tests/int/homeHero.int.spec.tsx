import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'

import type { General } from '@/payload-types'

let general: Partial<General> = {}

vi.mock('@/utilities/getGlobals', () => ({
  getCachedGlobal: () => async () => general,
}))

const { HomeHero } = await import('@/components/home/HomeHero')

/* Queried from the DOM rather than by role: the picture and its scrims sit
 * under `aria-hidden`, which is exactly where a decorative image belongs and
 * exactly what keeps it — and the stand-in that replaces it — out of the
 * accessibility tree. */
const hero = async () => {
  const { container } = render(await HomeHero())

  return {
    photograph: container.querySelector('img')?.getAttribute('src'),
    standIn: container.querySelector('[role="img"]')?.getAttribute('aria-label'),
  }
}

beforeEach(() => {
  general = {}
})

afterEach(cleanup)

describe('HomeHero', () => {
  it('draws the photograph the club chose', async () => {
    general = {
      homeHeroImage: {
        id: 7,
        url: '/api/media/file/col-du-galibier.jpg',
        updatedAt: '2026-09-20T09:00:00.000Z',
        createdAt: '2026-09-20T09:00:00.000Z',
      },
    }

    /* The `updatedAt` cache tag rides along, so replacing the file behind the
     * same filename reaches everyone rather than being served from a cache. */
    expect((await hero()).photograph).toBe(
      '/api/media/file/col-du-galibier.jpg?v=2026-09-20T09%3A00%3A00.000Z',
    )
  })

  /**
   * The hero is an upload like any other and renders through `Media`, so it is
   * served from the ladder sharp built rather than resized per request. It was
   * the last document on the site still going to the optimiser, and at `100vw`
   * the widest — so the most expensive one to leave there.
   */
  it('asks the optimiser for nothing', async () => {
    general = {
      homeHeroImage: {
        id: 7,
        url: '/api/media/file/col-du-galibier.jpg',
        updatedAt: '2026-09-20T09:00:00.000Z',
        createdAt: '2026-09-20T09:00:00.000Z',
      },
    }

    const { container } = render(await HomeHero())

    expect(container.innerHTML).not.toContain('/_next/image')
  })

  /* The global is the only source: with nothing chosen there is no second
   * photograph to fall back to, and the hero says so the way the rest of the
   * site says it. */
  it('shows the « à définir » stand-in when no photograph is chosen', async () => {
    expect(await hero()).toEqual({ photograph: undefined, standIn: 'Photo d’en-tête à définir' })
  })

  /* Belt and braces on the depth the global is read at: an unresolved upload
   * comes back as an id, which is not something `next/image` can draw. */
  it('shows the stand-in when the upload has not been resolved', async () => {
    general = { homeHeroImage: 7 }

    expect(await hero()).toEqual({ photograph: undefined, standIn: 'Photo d’en-tête à définir' })
  })
})
