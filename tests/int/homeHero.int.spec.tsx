import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'

import type { General } from '@/payload-types'

/**
 * Only the two props this test is about. Rendering the real `next/image` here
 * would put the src through the optimiser and answer a question about Next
 * rather than about the hero, and the rest of its props — `fill`, `priority` —
 * are not DOM attributes.
 */
vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element -- this is the stand-in for it
    <img alt={alt} src={typeof src === 'string' ? src : String(src)} />
  ),
}))

let general: Partial<General> = {}

vi.mock('@/utilities/getGlobals', () => ({
  getCachedGlobal: () => async () => general,
}))

const { HomeHero } = await import('@/components/home/HomeHero')

/* Queried from the DOM rather than by role: the photograph and its scrims sit
 * under `aria-hidden`, which is exactly where a decorative image belongs and
 * exactly what keeps it out of the accessibility tree. It is the hero's only
 * image. */
const heroSrc = async () => {
  const { container } = render(await HomeHero())

  return container.querySelector('img')?.getAttribute('src')
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
    expect(await heroSrc()).toBe(
      '/api/media/file/col-du-galibier.jpg?v=2026-09-20T09%3A00%3A00.000Z',
    )
  })

  /* The field is optional, and an empty one has to leave the club with the site
   * they had rather than with a blank band at the top of the home page. */
  it('falls back to the photograph the site ships with', async () => {
    expect(await heroSrc()).toContain('about-hero')
  })

  /* Belt and braces on the depth the global is read at: an unresolved upload
   * comes back as an id, which is not something `next/image` can draw. */
  it('falls back when the upload has not been resolved', async () => {
    general = { homeHeroImage: 7 }

    expect(await heroSrc()).toContain('about-hero')
  })
})
