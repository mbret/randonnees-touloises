import { createHmac, timingSafeEqual } from 'node:crypto'

import { isAllowedThumbnailHost } from './thumbnailHosts'
import type { Thumbnail } from './thumbnails'

/**
 * A media link's picture, served from this site at the size Google cuts it to.
 *
 * Google's image server resizes and re-encodes on request: the options after
 * the `=` in a `googleusercontent.com` address are a size and a format. So the
 * work `next/image` was billed for — the album covers were 304 of 305
 * transformations in the week that was measured — Google does for nothing, at
 * whatever width is asked, from the full photograph rather than the 600-pixel
 * card its `og:image` names.
 *
 * Still fetched by this site rather than linked: a cover addressed to Google
 * would have every visitor's browser hand Google their address on page load,
 * which the privacy notice says does not happen — the same reason the map
 * tiles come through `/map-tiles`. A browser asks the route below; the route
 * asks Google, once per picture per cache window.
 */

/** Where the route answers. */
export const THUMBNAIL_PATH = '/media-links/thumbnail'

/**
 * The widths a picture is offered at. A card is about 300 pixels wide on a
 * desktop and up to 600 on a phone, so these cover a desktop at 1x and 2x and
 * a phone's full-width card at 2x — denser than that is detail a thumbnail
 * cannot show. Anything else asked of the route is refused.
 */
export const THUMBNAIL_WIDTHS = [384, 640, 960] as const

/** The width a browser that ignores `srcset` is given. */
const FALLBACK_WIDTH = 640

/** The band a card draws its picture in, which a cover is cropped to. */
const BAND_RATIO = 9 / 16

/**
 * The route's signature on an address, so that it only fetches what a page of
 * this site asked for. Without one it would serve any Google photo through the
 * club's domain to whoever wrote the URL.
 *
 * Keyed with `PAYLOAD_SECRET`, which every environment that renders a page
 * already has, under a label of its own so that a signature made here can mean
 * nothing anywhere else. Rotating the secret leaves cached pages pointing at
 * addresses the route refuses until they are rendered again.
 */
const signature = (src: string) => {
  const secret = process.env.PAYLOAD_SECRET

  if (!secret) throw new Error('PAYLOAD_SECRET is needed to sign media link thumbnails')

  return createHmac('sha256', secret)
    .update(`media-link-thumbnail:${src}`)
    .digest()
    .subarray(0, 16)
    .toString('base64url')
}

const isSigned = (src: string, sig: string) => {
  const expected = Buffer.from(signature(src))
  const given = Buffer.from(sig)

  return given.length === expected.length && timingSafeEqual(given, expected)
}

/**
 * The address Google cuts `src` to `width` at, in WebP, or `null` for a picture
 * Google's image server does not resize — a video still, which comes in the
 * one size it is derived at.
 *
 * A square avatar is asked for square; anything else for the band's own 16:9,
 * so that nothing is left for the browser to crop.
 */
const sized = (src: URL, width: number): URL | null => {
  const at = src.pathname.indexOf('=')

  if (!src.hostname.endsWith('.googleusercontent.com') || at < 0) return null

  const options = src.pathname.slice(at + 1)
  const url = new URL(src)

  url.pathname = /^s\d/.test(options)
    ? `${src.pathname.slice(0, at)}=s${width}-rw`
    : `${src.pathname.slice(0, at)}=w${width}-h${Math.round(width * BAND_RATIO)}-p-k-rw`

  return url
}

/** The query a page of this site writes for `src` at `width`, and the only one the route answers. */
const query = (src: string, width?: number) =>
  `?${new URLSearchParams({
    src,
    ...(width ? { w: String(width) } : {}),
    sig: signature(src),
  })}`

const routeUrl = (src: string, width?: number) => `${THUMBNAIL_PATH}${query(src, width)}`

/** What a card's `<img>` is given: one address, and a `srcset` when Google can size it. */
export const proxiedThumbnail = ({ src }: Thumbnail): { src: string; srcSet?: string } => {
  if (!sized(new URL(src), FALLBACK_WIDTH)) return { src: routeUrl(src) }

  return {
    src: routeUrl(src, FALLBACK_WIDTH),
    srcSet: THUMBNAIL_WIDTHS.map((width) => `${routeUrl(src, width)} ${width}w`).join(', '),
  }
}

/**
 * The address the route should fetch for a request, or `null` for anything a
 * page of this site would not have asked for: an unsigned or altered address,
 * a host off the list, a width that is not offered, a width asked of a picture
 * that comes in one size or none asked of one that comes in several — and any
 * spelling of the address but the page's own.
 *
 * That last is what the edge's cache is keyed on: the query string, as sent.
 * An extra parameter, a repeated one, the same ones in another order, or a
 * character escaped differently would each still carry a valid signature, and
 * each be a cache entry of its own — a function run and a fetch from Google
 * per variant, without end, from one signature found on a page. Answering only
 * the spelling the page wrote leaves one entry per picture and width.
 */
export const upstreamFor = ({ search, searchParams }: URL): URL | null => {
  const src = searchParams.get('src')
  const sig = searchParams.get('sig')
  const w = searchParams.get('w')

  if (!src || !sig || !isAllowedThumbnailHost(src) || !isSigned(src, sig)) return null

  const width = w === null ? undefined : Number(w)

  if (search !== query(src, width)) return null

  if (width === undefined) return sized(new URL(src), FALLBACK_WIDTH) ? null : new URL(src)

  if (!(THUMBNAIL_WIDTHS as readonly number[]).includes(width)) return null

  return sized(new URL(src), width)
}
