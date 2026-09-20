import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'

import type { Media } from '@/payload-types'

import nextConfig from '../../next.config.js'

/**
 * Every assertion here is about money.
 *
 * Vercel bills one image transformation per distinct combination of source URL,
 * width, quality and `Accept` header, and keeps the result for at most 31 days.
 * The most-requested of the club's 249 uploads cost about seventeen
 * transformations apiece, which puts one pass over the library past a month's
 * allowance — and when that allowance ran out `/_next/image` answered 402 and
 * every image on the site rendered as its alt text.
 *
 * So what `ImageMedia` asks for is not a detail of presentation. These pin the
 * three things that decide the bill: which uploads go to the optimiser at all,
 * how many widths it may be asked for, and how many qualities of each.
 */
const { received } = vi.hoisted(() => ({ received: [] as Record<string, unknown>[] }))

/**
 * The real `next/image` would rewrite `src` into an optimiser URL, which is a
 * question about Next. What this test is about is the props handed to it.
 */
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    received.push(props)

    return null
  },
}))

const { ImageMedia } = await import('@/components/Media/ImageMedia')

const upload = (overrides: Partial<Media> = {}): Media => ({
  id: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  url: '/api/media/file/photo.jpg',
  mimeType: 'image/jpeg',
  filesize: 500 * 1024,
  width: 2000,
  height: 1000,
  ...overrides,
})

/** The props `ImageMedia` handed the image component for this render. */
const propsFor = (element: React.ReactElement) => {
  received.length = 0
  render(element)

  return received[0]
}

afterEach(cleanup)

describe('what an upload is allowed to cost', () => {
  /**
   * The floor Vercel gives for this is 10 KB, which catches nine of the 249
   * uploads. A small share, but the clearest waste: `logo-nordic-outing.png` is
   * 4 kB and came back 19% smaller, having been transformed eighteen times to
   * manage it.
   */
  it('leaves an upload too small to gain anything alone', () => {
    expect(propsFor(<ImageMedia resource={upload({ filesize: 4 * 1024 })} />)).toMatchObject({
      unoptimized: true,
    })
  })

  it('still optimises an upload with something to gain', () => {
    expect(propsFor(<ImageMedia resource={upload({ filesize: 500 * 1024 })} />)).toMatchObject({
      unoptimized: false,
    })
  })

  /** Exactly at the floor is below the point of bothering, one byte over is not. */
  it('reads the floor as the last size not worth optimising', () => {
    expect(propsFor(<ImageMedia resource={upload({ filesize: 10 * 1024 })} />)).toMatchObject({
      unoptimized: true,
    })
    expect(propsFor(<ImageMedia resource={upload({ filesize: 10 * 1024 + 1 })} />)).toMatchObject({
      unoptimized: false,
    })
  })

  /**
   * By type rather than by size: a vector is already what the optimiser would be
   * flattening and a GIF loses its animation, however large either one is. Next
   * exempts SVG itself, but only when `src` ends in `.svg` — ours never does,
   * because `getMediaUrl` stamps a `?v=` cache tag onto every URL.
   */
  it('never rasterises a vector or flattens an animation, whatever their size', () => {
    const big = { filesize: 900 * 1024 }

    expect(
      propsFor(<ImageMedia resource={upload({ ...big, mimeType: 'image/svg+xml' })} />),
    ).toMatchObject({ unoptimized: true })
    expect(
      propsFor(<ImageMedia resource={upload({ ...big, mimeType: 'image/gif' })} />),
    ).toMatchObject({ unoptimized: true })
  })
})

describe('how many widths an upload is offered at', () => {
  /**
   * `sizes` is what makes Next offer the whole `deviceSizes` + `imageSizes`
   * srcset rather than the intrinsic width at 1x and 2x, so an image that does
   * not know its rendered size is cheaper for saying nothing.
   */
  it('claims no rendered size for an image measured by its own width', () => {
    expect(propsFor(<ImageMedia resource={upload()} />).sizes).toBeUndefined()
  })

  it('measures a fill image against the viewport, which is what it fills', () => {
    expect(propsFor(<ImageMedia fill resource={upload()} />).sizes).toBe('100vw')
  })

  it('takes a rendered size from a caller that knows it', () => {
    expect(propsFor(<ImageMedia resource={upload()} size="192px" />).sizes).toBe('192px')
  })

  /**
   * The default this replaced was built from the breakpoints in descending order
   * with `w` descriptors, which belong to `srcset`. `sizes` takes CSS lengths,
   * so every entry was invalid and the browser fell back to `100vw` — which is
   * how a 40px logo came to be served the widest file on offer.
   */
  it('never writes a srcset descriptor where a CSS length belongs', () => {
    const sizes = propsFor(<ImageMedia fill resource={upload()} />).sizes

    expect(sizes).not.toMatch(/\d+w\b/)
  })
})

describe('how many qualities of each width are stored', () => {
  /** Whatever the one allowed quality is, the shared component does not ask for another. */
  it('asks for no quality of its own', () => {
    expect(propsFor(<ImageMedia resource={upload()} />).quality).toBeUndefined()
  })

  it('allows exactly one quality, so a width is stored once', () => {
    expect(nextConfig.images?.qualities).toEqual([75])
  })

  /**
   * Fifteen widths is Next's default, not a decision. Nothing the club
   * publishes needs a 4K variant, and each width kept is a stored copy per
   * format, renewed monthly.
   */
  it('keeps the width budget to what the layouts actually ask for', () => {
    const { deviceSizes = [], imageSizes = [] } = nextConfig.images ?? {}

    expect(deviceSizes).toEqual([640, 828, 1200, 1920])
    expect(imageSizes).toEqual([48, 96, 192, 384])

    /* What the two lists mean: `imageSizes` serves images declared smaller than
     * the screen, so an entry at or above the smallest device width would never
     * be chosen from it. */
    expect(Math.max(...imageSizes)).toBeLessThan(Math.min(...deviceSizes))
  })
})
