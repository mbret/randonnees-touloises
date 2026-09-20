import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'

import type { Media } from '@/payload-types'

import nextConfig from '../../next.config.js'

import { ImageMedia } from '@/components/Media/ImageMedia'
import { Media as MediaCollection } from '@/collections/Media'
import { MEDIA_CACHE_TAG_PARAM } from '@/utilities/mediaCacheTag'

/**
 * Every assertion here is about money.
 *
 * A request-time transformation is billed per distinct combination of source
 * URL, width, quality and `Accept` header, and kept for at most 31 days. The
 * club's 249 uploads cost about seventeen of those apiece — more than a
 * month's allowance for one pass over the library, renewed monthly — and when
 * the allowance ran out the optimiser answered 402 and every image on the site
 * rendered as its alt text.
 *
 * Sharp already builds a width ladder for each upload, once, into storage
 * charged by the gigabyte. These pin the site to serving that ladder: what is
 * offered, what happens when a rung is missing, and that nothing reaches for
 * the optimiser again.
 */
const REVISION = '2026-01-01T00:00:00.000Z'
const TAG = `${MEDIA_CACHE_TAG_PARAM}=${encodeURIComponent(REVISION)}`

const rung = (name: string, width: number) => ({
  url: `/api/media/file/photo-${name}.webp`,
  width,
  height: Math.round(width / 2),
  mimeType: 'image/webp',
  filesize: width * 10,
  filename: `photo-${name}.webp`,
})

/** Every rung Payload generates for an upload large enough to fill the ladder. */
const fullLadder = {
  thumbnail: rung('thumbnail', 300),
  small: rung('small', 600),
  medium: rung('medium', 900),
  large: rung('large', 1400),
  xlarge: rung('xlarge', 1920),
}

const upload = (overrides: Partial<Media> = {}): Media => ({
  id: 1,
  createdAt: REVISION,
  updatedAt: REVISION,
  url: '/api/media/file/photo.jpg',
  mimeType: 'image/jpeg',
  filesize: 500 * 1024,
  width: 2000,
  height: 1000,
  sizes: fullLadder,
  ...overrides,
})

const renderMedia = (element: React.ReactElement) => {
  const { container } = render(element)

  return {
    img: container.querySelector('img')!,
    source: container.querySelector('source'),
    html: container.innerHTML,
  }
}

afterEach(cleanup)

describe('the ladder a browser is offered', () => {
  it('offers every rung Payload generated, narrowest first', () => {
    const { source } = renderMedia(<ImageMedia resource={upload()} />)

    expect(source?.getAttribute('srcset')).toBe(
      [
        `/api/media/file/photo-thumbnail.webp?${TAG} 300w`,
        `/api/media/file/photo-small.webp?${TAG} 600w`,
        `/api/media/file/photo-medium.webp?${TAG} 900w`,
        `/api/media/file/photo-large.webp?${TAG} 1400w`,
        `/api/media/file/photo-xlarge.webp?${TAG} 1920w`,
      ].join(', '),
    )
  })

  /**
   * The ladder is WebP, so it is offered by type rather than as the `<img>`'s
   * own `srcset` — a browser that cannot decode it has to be able to skip past.
   */
  it('offers the ladder as a typed source, not as the image itself', () => {
    const { img, source } = renderMedia(<ImageMedia resource={upload()} />)

    expect(source?.getAttribute('type')).toBe('image/webp')
    expect(img.getAttribute('srcset')).toBeNull()
  })

  /**
   * Payload omits a rung wider than the original rather than upscaling into it,
   * so most of the ladder is missing on a narrow upload. Offering a rung that
   * was never generated would be a 404 per visitor.
   */
  it('offers only the rungs that exist', () => {
    const { source } = renderMedia(
      <ImageMedia resource={upload({ sizes: { thumbnail: rung('thumbnail', 300) } })} />,
    )

    expect(source?.getAttribute('srcset')).toBe(`/api/media/file/photo-thumbnail.webp?${TAG} 300w`)
  })

  /**
   * An upload from before the ladder has rungs too — JPEG and PNG ones, built
   * under the previous config. Offering those under `type="image/webp"` says
   * something untrue, and it survives only on the browser sniffing the bytes it
   * actually receives. It shipped that way and reached production: thirteen PNG
   * rungs and one JPEG were being advertised as WebP on the home page.
   */
  it('offers no ladder built before the format changed', () => {
    const legacy = {
      ...rung('medium', 900),
      url: '/api/media/file/photo-900x600.png',
      mimeType: 'image/png',
      filename: 'photo-900x600.png',
    }
    const { img, source } = renderMedia(
      <ImageMedia resource={upload({ sizes: { medium: legacy } })} />,
    )

    expect(source).toBeNull()
    expect(img.getAttribute('src')).toBe(`/api/media/file/photo.jpg?${TAG}`)
  })

  /** A half-regenerated document offers the rungs that were rebuilt and no others. */
  it('offers only the rungs already in the advertised format', () => {
    const legacy = {
      ...rung('medium', 900),
      url: '/api/media/file/photo-900x600.png',
      mimeType: 'image/png',
      filename: 'photo-900x600.png',
    }
    const { source } = renderMedia(
      <ImageMedia
        resource={upload({ sizes: { thumbnail: rung('thumbnail', 300), medium: legacy } })}
      />,
    )

    expect(source?.getAttribute('srcset')).toBe(`/api/media/file/photo-thumbnail.webp?${TAG} 300w`)
  })

  /**
   * A vector has no ladder, and neither does an upload from before the
   * backfill. Both still have to render, which is what the original is for.
   */
  it('offers no source at all when nothing was generated', () => {
    const { img, source } = renderMedia(<ImageMedia resource={upload({ sizes: {} })} />)

    expect(source).toBeNull()
    expect(img.getAttribute('src')).toBe(`/api/media/file/photo.jpg?${TAG}`)
  })

  /**
   * Sharp reads the first frame of a GIF and writes a still, so a rung of an
   * animated one is the animation stopped dead — and a matching `<source>` is
   * committed to, so offering the ladder is how the animation would be lost.
   */
  it('offers no ladder for an animation, however many rungs exist', () => {
    const { img, source } = renderMedia(
      <ImageMedia resource={upload({ mimeType: 'image/gif', url: '/api/media/file/loop.gif' })} />,
    )

    expect(source).toBeNull()
    expect(img.getAttribute('src')).toBe(`/api/media/file/loop.gif?${TAG}`)
  })

  it('always leaves the original on the image, whatever the ladder holds', () => {
    const { img } = renderMedia(<ImageMedia resource={upload()} />)

    expect(img.getAttribute('src')).toBe(`/api/media/file/photo.jpg?${TAG}`)
  })

  /** One revision addresses the original and every rung, so one edit clears them together. */
  it('stamps the document revision on every URL it writes', () => {
    const { html } = renderMedia(<ImageMedia resource={upload()} />)

    expect(html.match(/photo[^"\s]*\.(webp|jpg)/g)?.length).toBe(6)
    expect(html.match(new RegExp(TAG.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))?.length).toBe(6)
  })
})

describe('the top of the ladder', () => {
  const rungs = (
    typeof MediaCollection.upload === 'object' ? (MediaCollection.upload.imageSizes ?? []) : []
  ).filter((size) => size.formatOptions?.format === 'webp')

  /**
   * Omitting a rung wider than the original stops the ladder at the last rung
   * below the original rather than at the original itself, and that gap is
   * where a poster fell through: 527px clears 300 and misses 600, so its only
   * WebP was the 300. A `<source>` wins over the `<img>` beneath it, so a
   * full-bleed hero 1318px wide was served 300px while the 527 sat in the
   * bucket with nothing able to ask for it.
   *
   * `withoutEnlargement: true` on the widest rung is the whole of the fix.
   * Sharp still refuses to scale up, so what comes back is the original at its
   * own size, and the top of the ladder is `min(original, 1920)`.
   */
  it('lets the widest rung fall back to the original’s own width', () => {
    const widest = rungs.reduce((a, b) => ((b.width ?? 0) > (a.width ?? 0) ? b : a))

    expect(widest.width).toBe(1920)
    expect(widest.withoutEnlargement).toBe(true)
  })

  /**
   * And no rung below it. Each one set the same way would return that same
   * copy — four more encodes and four more writes for a file the top rung has
   * already made, under a name generated from the dimensions, so every one of
   * them lands on it anyway.
   */
  it('leaves the rungs below it to be omitted rather than repeated', () => {
    const below = rungs.filter((size) => size.width !== 1920)

    expect(below.length).toBeGreaterThan(0)
    below.forEach((size) => expect(size.withoutEnlargement).toBeUndefined())
  })

  /** The poster that went looking for 1318px and was handed 300. */
  it('reaches the original’s own width on an upload narrower than a rung', () => {
    const { source } = renderMedia(
      <ImageMedia
        resource={upload({
          width: 527,
          height: 745,
          sizes: { thumbnail: rung('300x424', 300), xlarge: rung('527x745', 527) },
        })}
      />,
    )

    expect(source?.getAttribute('srcset')).toBe(
      [
        `/api/media/file/photo-300x424.webp?${TAG} 300w`,
        `/api/media/file/photo-527x745.webp?${TAG} 527w`,
      ].join(', '),
    )
  })

  /**
   * An upload exactly as wide as a rung has that rung and the capped top one
   * land on the same width — and Payload names a generated file after its
   * dimensions and reuses it across sizes, so they are one file under one name.
   * Offering it twice says nothing the first entry did not.
   */
  it('offers a width once when two rungs land on the same file', () => {
    const shared = rung('600x400', 600)
    const { source } = renderMedia(
      <ImageMedia
        resource={upload({
          width: 600,
          height: 400,
          sizes: { thumbnail: rung('300x200', 300), small: shared, xlarge: shared },
        })}
      />,
    )

    expect(source?.getAttribute('srcset')).toBe(
      [
        `/api/media/file/photo-300x200.webp?${TAG} 300w`,
        `/api/media/file/photo-600x400.webp?${TAG} 600w`,
      ].join(', '),
    )
  })
})

describe('what the browser is told to pick with', () => {
  /**
   * The choice is made before layout, so a browser told nothing assumes the
   * image is as wide as the viewport and takes the widest rung for a 200px
   * card. `100vw` is the honest answer for the full-bleed images that do not
   * say; the rest say.
   */
  it('falls back to the viewport', () => {
    const { img, source } = renderMedia(<ImageMedia resource={upload()} />)

    expect(img.getAttribute('sizes')).toBe('100vw')
    expect(source?.getAttribute('sizes')).toBe('100vw')
  })

  it('takes a rendered size from a caller that knows it, on both', () => {
    const { img, source } = renderMedia(<ImageMedia resource={upload()} size="192px" />)

    expect(img.getAttribute('sizes')).toBe('192px')
    expect(source?.getAttribute('sizes')).toBe('192px')
  })

  /**
   * `w` descriptors belong to `srcset`; `sizes` takes CSS lengths. Written the
   * other way round every entry is invalid, the browser discards them all and
   * falls back to `100vw` — which is how a 40px logo came to be served the
   * widest file on offer.
   */
  it('never writes a srcset descriptor where a CSS length belongs', () => {
    const { img } = renderMedia(<ImageMedia resource={upload()} />)

    expect(img.getAttribute('sizes')).not.toMatch(/\d+w\b/)
  })
})

describe('what is no longer asked of the optimiser', () => {
  /** The whole point: not one URL on the page routes through a paid transformation. */
  it('routes nothing through the image optimiser', () => {
    const { html } = renderMedia(<ImageMedia resource={upload()} />)

    expect(html).not.toContain('/_next/image')
  })

  it('routes nothing through it for a static import either', () => {
    const staticImage = { src: '/_next/static/media/hero.abc123.webp', width: 1600, height: 900 }
    const { html, img } = renderMedia(<ImageMedia src={staticImage} />)

    expect(html).not.toContain('/_next/image')
    expect(img.getAttribute('src')).toBe(staticImage.src)
  })

  /**
   * `next/image` is still what serves the `mediaLinks` block's remote
   * thumbnails and the few static assets imported directly, so these bounds
   * still hold — they are simply no longer what decides the bill.
   */
  it('keeps the remaining optimiser usage bounded', () => {
    const { deviceSizes = [], imageSizes = [], qualities } = nextConfig.images ?? {}

    expect(qualities).toEqual([75])
    expect(deviceSizes).toEqual([640, 828, 1200, 1920])
    expect(imageSizes).toEqual([48, 96, 192, 384])
    expect(Math.max(...imageSizes)).toBeLessThan(Math.min(...deviceSizes))
  })
})

describe('what the image component still has to do itself', () => {
  /**
   * `fill` was `next/image`'s, and the heroes depend on it: the picture is
   * taken out of flow and stretched over the ancestor they position, so their
   * own text can sit on top of it.
   */
  it('takes a fill image out of flow and stretches it', () => {
    const { img } = renderMedia(<ImageMedia fill resource={upload()} />)

    expect(img.style.position).toBe('absolute')
    expect(img.style.width).toBe('100%')
    expect(img.style.height).toBe('100%')
    expect(img.getAttribute('width')).toBeNull()
    expect(img.getAttribute('height')).toBeNull()
  })

  /** Intrinsic dimensions everywhere else, so the page does not jump as images arrive. */
  it('carries intrinsic dimensions when it is not filling', () => {
    const { img } = renderMedia(<ImageMedia resource={upload()} />)

    expect(img.getAttribute('width')).toBe('2000')
    expect(img.getAttribute('height')).toBe('1000')
  })

  it('loads lazily unless it is the one the page is judged on', () => {
    expect(renderMedia(<ImageMedia resource={upload()} />).img.getAttribute('loading')).toBe('lazy')

    const priority = renderMedia(<ImageMedia priority resource={upload()} />).img

    expect(priority.getAttribute('loading')).toBe('eager')
    expect(priority.getAttribute('fetchpriority')).toBe('high')
  })
})
