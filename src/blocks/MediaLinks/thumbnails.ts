import { unstable_cache } from 'next/cache'

/**
 * The picture a link shows of itself, read from the page it points at.
 *
 * Google Photos and YouTube both publish an `og:image` — an album's cover crop,
 * a channel's avatar, a video's still — so a card can illustrate itself from
 * nothing but the address an editor pasted. That is the whole point of the
 * automatic thumbnail: the committee adds a row and gets a picture, without
 * having to find, crop and upload one.
 *
 * This has to happen on the server. A browser cannot read another origin's
 * `<head>` — neither Google nor YouTube sends `Access-Control-Allow-Origin`, so
 * a client-side version of this would be blocked by CORS no matter how it were
 * written. Fetching here also means the visitor's browser never talks to
 * Google: `next/image` re-serves the picture from our own origin.
 */
export type Thumbnail = {
  src: string
  /** Present when the page declared them, which is what tells a square avatar
   *  from a wide photo — see `isSquarish`. */
  width?: number
  height?: number
}

/** A day. These pictures change when an album's cover changes: rarely. */
const REVALIDATE_SECONDS = 86_400

/** The tag that drops every cached thumbnail, should one ever need forcing. */
export const THUMBNAIL_CACHE_TAG = 'media-link-thumbnails'

/**
 * Long enough for a redirect chain — `photos.app.goo.gl` is a shortener — plus
 * the better part of a megabyte of markup, and short enough that a hanging host
 * cannot hold a page render open.
 */
const TIMEOUT_MS = 10_000

/**
 * Both pages carry their `og:` tags about a megabyte in, behind a wall of
 * inline script: Google Photos declares `og:image` at roughly byte 1_100_000 of
 * 1_400_000, YouTube at 743_000 of 905_000. So the cap has to clear a megabyte
 * to be worth having at all, and reading stops on the tags rather than on the
 * cap in the ordinary case.
 */
const MAX_BYTES = 2 * 1024 * 1024

/**
 * How far past `og:image` to keep reading for its dimensions. They follow it
 * immediately — 219 characters later on YouTube — so this is already generous.
 */
const TRAILING_CHARS = 4_096

/** Overlap between chunk scans, so a tag split across two is still seen whole. */
const SCAN_OVERLAP = 64

/**
 * Sent because a request with no user agent is the one most likely to be served
 * something other than the page a visitor would get. Named honestly rather than
 * disguised as a browser.
 */
const USER_AGENT =
  'Mozilla/5.0 (compatible; RandonneesTouloisesBot/1.0; +https://randonnees-touloises.net)'

/**
 * Hosts that must never be fetched, whatever an editor pastes or a redirect
 * lands on. A URL field that makes the server issue a request is a request
 * forgery primitive, and the only reason it is a mild one here is that the
 * field is behind the admin login.
 */
const isPrivateHost = (hostname: string) => {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')

  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal')) return true
  if (host === '::1' || host.startsWith('fc') || host.startsWith('fd')) return true

  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)

  if (!v4) return false

  const [a, b] = v4.slice(1).map(Number)

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  )
}

/**
 * The video a YouTube address names, across the four shapes YouTube hands out.
 * A channel address names no video and yields nothing here — its avatar comes
 * from the `og:image` route like anything else.
 */
const youtubeVideoId = (url: URL): string | null => {
  const host = url.hostname.replace(/^www\.|^m\./, '')

  if (host === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null

  if (host !== 'youtube.com' && host !== 'youtube-nocookie.com') return null

  if (url.pathname === '/watch') return url.searchParams.get('v')

  const path = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/)

  return path?.[1] ?? null
}

/** `&amp;` is how an attribute value carries an `&`, and these URLs are full of them. */
const decodeEntities = (value: string) =>
  value
    .replace(/&(?:amp|#0*38|#x0*26);/gi, '&')
    .replace(/&(?:quot|#0*34|#x0*22);/gi, '"')
    .replace(/&(?:#0*39|#x0*27|apos);/gi, "'")
    .replace(/&(?:lt|#0*60|#x0*3c);/gi, '<')
    .replace(/&(?:gt|#0*62|#x0*3e);/gi, '>')

/**
 * One meta tag's content, written for either attribute order — `property` then
 * `content` is the common one, but nothing requires it and both appear in the
 * wild.
 */
const metaContent = (html: string, name: string): string | undefined => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const attr = `(?:property|name)=["']${escaped}["']`
  const content = `content=["']([^"']*)["']`

  const match =
    html.match(new RegExp(`<meta[^>]*${attr}[^>]*${content}`, 'i')) ??
    html.match(new RegExp(`<meta[^>]*${content}[^>]*${attr}`, 'i'))

  return match?.[1] ? decodeEntities(match[1]) : undefined
}

/**
 * As much of the page as it takes to reach the `og:` tags.
 *
 * Explicitly not "the head": YouTube closes its `<head>` some fifty thousand
 * bytes *before* declaring `og:image`, so stopping at `</head>` would read more
 * than a megabyte and still come away with nothing. There is no structural
 * landmark to stop on, so this stops on the thing actually being looked for.
 *
 * Streamed rather than buffered whole so that a page which does put its tags up
 * front — most of the web — costs a few kilobytes rather than the full
 * document.
 */
const readMeta = async (response: Response): Promise<string> => {
  const body = response.body

  if (!body) return ''

  const reader = body.getReader()
  const decoder = new TextDecoder()

  let html = ''
  let bytes = 0
  let scanFrom = 0
  let imageAt = -1

  try {
    while (bytes < MAX_BYTES) {
      const { done, value } = await reader.read()

      if (done) break

      bytes += value.byteLength
      html += decoder.decode(value, { stream: true })

      /* Each chunk is scanned from a little before where the last scan ended,
       * rather than from the start, so this stays linear in the page's size. */
      if (imageAt < 0) {
        imageAt = html.indexOf('og:image', scanFrom)
        scanFrom = Math.max(html.length - SCAN_OVERLAP, 0)
      }

      if (imageAt < 0) continue

      /* Enough in hand: either the dimensions have arrived, or far enough past
       * the image tag has been read that they are not coming. */
      if (html.includes('og:image:height', imageAt)) break
      if (html.length - imageAt > TRAILING_CHARS) break
    }
  } finally {
    /* The response is abandoned mid-stream on purpose, so the socket has to be
     * released explicitly or it is held until the connection times out. */
    await reader.cancel().catch(() => {})
  }

  return html
}

const fetchThumbnail = async (link: string): Promise<Thumbnail | null> => {
  let url: URL

  try {
    url = new URL(link)
  } catch {
    return null
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (isPrivateHost(url.hostname)) return null

  /* A video's still is derivable from its address, so no request is made for
   * one at all — and `i.ytimg.com` answers for every video, published or not. */
  const videoId = youtubeVideoId(url)

  if (videoId) {
    return { src: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, width: 480, height: 360 }
  }

  try {
    const response = await fetch(url, {
      headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': USER_AGENT },
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!response.ok) return null
    if (!response.headers.get('content-type')?.includes('html')) return null
    /* Checked after the redirects rather than only before: the address an
     * editor pasted is not necessarily the one that ends up being read. */
    if (isPrivateHost(new URL(response.url).hostname)) return null

    const html = await readMeta(response)
    const src = metaContent(html, 'og:image') ?? metaContent(html, 'twitter:image')

    if (!src) return null

    const resolved = new URL(src, response.url)

    if (resolved.protocol !== 'https:' && resolved.protocol !== 'http:') return null

    const width = Number(metaContent(html, 'og:image:width'))
    const height = Number(metaContent(html, 'og:image:height'))

    return {
      src: resolved.toString(),
      width: Number.isFinite(width) && width > 0 ? width : undefined,
      height: Number.isFinite(height) && height > 0 ? height : undefined,
    }
  } catch {
    /* A timeout, a refused connection, a page that is not HTML. The card falls
     * back to its platform icon, which is a fine thing for it to look like. */
    return null
  }
}

/**
 * Cached for a day, and a failure is cached with the successes.
 *
 * Deliberate: this runs while a page is rendering, so a host that is refusing
 * or hanging must cost its timeout once a day rather than once a render. The
 * price is that a thumbnail missed during an outage stays missed until the day
 * turns, or until `THUMBNAIL_CACHE_TAG` is revalidated.
 */
export const resolveThumbnail = (link: string): Promise<Thumbnail | null> =>
  unstable_cache(() => fetchThumbnail(link), ['mediaLinkThumbnail', link], {
    revalidate: REVALIDATE_SECONDS,
    tags: [THUMBNAIL_CACHE_TAG],
  })()

/**
 * Whether a picture is close enough to square that filling a 16:9 card with it
 * would be a crop worth avoiding — a channel avatar or a logo, rather than a
 * photograph. Unknown dimensions read as wide, which is what a photo is.
 */
export const isSquarish = ({ width, height }: Thumbnail) =>
  Boolean(width && height && width / height < 1.2)
