import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from '@/app/(frontend)/media-links/thumbnail/route'
import { isAllowedThumbnailHost } from '@/blocks/MediaLinks/thumbnailHosts'
import { proxiedThumbnail } from '@/blocks/MediaLinks/thumbnailProxy'

/** What the three kinds of `og:image` look like, as the resolver hands them over. */
const COVER = 'https://lh3.googleusercontent.com/pw/AP1GczCover=w600-h315-p-k'
const AVATAR = 'https://yt3.googleusercontent.com/channel-avatar=s900-c-k-c0x00ffffff-no-rj'
const STILL = 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'

beforeEach(() => {
  vi.stubEnv('PAYLOAD_SECRET', 'a-secret-for-tests')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

/** Google, answering with a picture, and remembering what it was asked. */
const google = (
  response = new Response('webp-bytes', { headers: { 'content-type': 'image/webp' } }),
) => {
  const fetch = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetch)

  return fetch
}

/** The address a card's `srcset` names for a picture at a width. */
const offered = (src: string, width: number) => {
  const candidate = proxiedThumbnail({ src })
    .srcSet?.split(', ')
    .find((entry) => entry.endsWith(` ${width}w`))

  return new URL(candidate!.split(' ')[0], 'https://randonnees-touloises.net')
}

/** The route asked for an address, as a browser would ask it. */
const ask = (url: URL) => GET(new Request(url))

/** What the route asked Google for. */
const askedOf = (fetch: ReturnType<typeof google>) => String(fetch.mock.calls[0][0])

describe('the hosts a thumbnail may come from', () => {
  it.each(['https://lh3.googleusercontent.com/pw/x=w600', COVER, AVATAR, STILL])(
    'takes %s',
    (src) => {
      expect(isAllowedThumbnailHost(src)).toBe(true)
    },
  )

  /* A wildcard is matched on a label boundary: what ends in the domain's name
   * without being under it is somebody else's. */
  it.each([
    'https://notgoogleusercontent.com/image',
    'https://googleusercontent.com/image',
    'https://lh3.googleusercontent.com.example.net/image',
    'https://lh3.googleusercontent.com@example.net/image',
    'https://example.net/#.googleusercontent.com',
    'https://evil-i.ytimg.com/image.jpg',
    'http://lh3.googleusercontent.com/pw/x=w600',
    'not an address',
  ])('refuses %s', (src) => {
    expect(isAllowedThumbnailHost(src)).toBe(false)
  })
})

describe('what a card offers', () => {
  /*
   * The whole point: every address the browser is given is this site's own, so
   * the reader's browser never talks to Google.
   */
  it('offers a cover at every width on offer, through this site', () => {
    const { src, srcSet } = proxiedThumbnail({ src: COVER })
    const candidates = srcSet!.split(', ')

    expect(candidates.map((entry) => entry.split(' ')[1])).toEqual(['384w', '640w', '960w'])

    for (const entry of [src, ...candidates.map((c) => c.split(' ')[0])]) {
      expect(entry.startsWith('/media-links/thumbnail?')).toBe(true)
    }

    expect(new URL(src, 'https://x.test').searchParams.get('w')).toBe('640')
  })

  /* A still comes in the one size it is derived at, so there is nothing to
   * choose between. */
  it('offers a video still at the one size it comes in', () => {
    const { src, srcSet } = proxiedThumbnail({ src: STILL })

    expect(srcSet).toBeUndefined()
    expect(new URL(src, 'https://x.test').searchParams.has('w')).toBe(false)
  })
})

describe('the route that serves a media link’s picture', () => {
  it('asks Google for the cover cut to the width and to the band, in WebP', async () => {
    const fetch = google()
    const response = await ask(offered(COVER, 640))

    expect(response.status).toBe(200)
    expect(askedOf(fetch)).toBe('https://lh3.googleusercontent.com/pw/AP1GczCover=w640-h360-p-k-rw')
  })

  it('asks for an avatar square', async () => {
    const fetch = google()

    await ask(offered(AVATAR, 384))

    expect(askedOf(fetch)).toBe('https://yt3.googleusercontent.com/channel-avatar=s384-rw')
  })

  it('fetches a video still as it is', async () => {
    const fetch = google(new Response('jpeg', { headers: { 'content-type': 'image/jpeg' } }))
    const response = await ask(new URL(proxiedThumbnail({ src: STILL }).src, 'https://x.test'))

    expect(response.status).toBe(200)
    expect(askedOf(fetch)).toBe(STILL)
  })

  /*
   * Google only ever hears from the server, once per picture per cache window,
   * which is what the long `s-maxage` is for.
   */
  it('lets the edge hold the picture for a long time', async () => {
    google()
    const response = await ask(offered(COVER, 384))

    expect(response.headers.get('cache-control')).toMatch(/public/)
    expect(response.headers.get('cache-control')).toMatch(/s-maxage=2592000/)
    expect(response.headers.get('content-type')).toBe('image/webp')
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
  })

  /*
   * Anything a page of this site would not have asked for is refused before
   * Google hears of it — which is what keeps the route from serving any Google
   * photo through the club's domain to whoever writes the URL.
   */
  describe('refuses, without asking anyone,', () => {
    const tampered = (edit: (params: URLSearchParams) => void) => {
      const url = offered(COVER, 640)

      edit(url.searchParams)

      return url
    }

    it.each<[string, (params: URLSearchParams) => void]>([
      ['an address with no signature', (p) => p.delete('sig')],
      ['another picture under this one’s signature', (p) => p.set('src', AVATAR)],
      ['a width that is not offered', (p) => p.set('w', '1920')],
      ['a width that is not a number', (p) => p.set('w', 'large')],
      ['no picture at all', (p) => p.delete('src')],
    ])('%s', async (_case, edit) => {
      const fetch = google()
      const response = await ask(tampered(edit))

      expect(response.status).toBe(404)
      expect(fetch).not.toHaveBeenCalled()
    })

    it('a width asked of a picture that comes in one size', async () => {
      const fetch = google()
      const url = new URL(proxiedThumbnail({ src: STILL }).src, 'https://x.test')

      url.searchParams.set('w', '640')

      expect((await ask(url)).status).toBe(404)
      expect(fetch).not.toHaveBeenCalled()
    })

    /* Signed or not, a host off the list is not fetched: the list is what a
     * key that got out would still run into. */
    it('a host off the list, even signed', async () => {
      const fetch = google()
      const elsewhere = 'https://images.example.com/photo=w600-h315'
      const url = new URL(proxiedThumbnail({ src: elsewhere }).src, 'https://x.test')

      expect((await ask(url)).status).toBe(404)
      expect(fetch).not.toHaveBeenCalled()
    })

    it('a signature made under another secret', async () => {
      const fetch = google()
      const url = offered(COVER, 640)

      vi.stubEnv('PAYLOAD_SECRET', 'a-rotated-secret')

      expect((await ask(url)).status).toBe(404)
      expect(fetch).not.toHaveBeenCalled()
    })

    /* A cover always comes at one of the widths on offer; asked for with none,
     * it is an address no page wrote. */
    it('a cover asked for at no width', async () => {
      const fetch = google()

      expect((await ask(tampered((p) => p.delete('w')))).status).toBe(404)
      expect(fetch).not.toHaveBeenCalled()
    })
  })

  /*
   * The edge caches on the query string as sent, so any other spelling of a
   * signed address would be a cache entry of its own: a function run and a
   * fetch from Google for each, without end, from one signature on the page.
   */
  describe('refuses any spelling of a signed address but the page’s own:', () => {
    /** The address the page wrote, with its query rewritten by hand. */
    const respelled = (rewrite: (search: string) => string) => {
      const url = offered(COVER, 640)

      url.search = rewrite(url.search)

      return url
    }

    it.each<[string, (search: string) => string]>([
      ['a parameter added', (search) => `${search}&nonce=1`],
      ['a parameter repeated', (search) => `${search}&w=640`],
      [
        'the same parameters in another order',
        (search) => `?${new URLSearchParams(search).toString().split('&').reverse().join('&')}`,
      ],
      ['a character escaped that the page left bare', (search) => search.replace('lh3', '%6Ch3')],
      ['a width written another way', (search) => search.replace('w=640', 'w=0640')],
    ])('%s', async (_case, rewrite) => {
      const fetch = google()
      const url = respelled(rewrite)

      /* Each would still carry a valid signature for the same picture. */
      expect(url.searchParams.get('src')).toBe(COVER)

      expect((await ask(url)).status).toBe(404)
      expect(fetch).not.toHaveBeenCalled()
    })

    it('while the page’s own spelling is served', async () => {
      google()

      expect((await ask(respelled((search) => search))).status).toBe(200)
    })
  })

  /*
   * The list is checked on the address asked for; where a redirect would lead
   * is not, so none is followed. Google's image servers answer a sized picture
   * directly.
   */
  it('follows no redirect', async () => {
    const fetch = vi.fn(async (_url: URL, init?: RequestInit) => {
      if (init?.redirect === 'error') throw new TypeError('fetch failed: unexpected redirect')

      return new Response('inner-bytes', { headers: { 'content-type': 'image/png' } })
    })

    vi.stubGlobal('fetch', fetch)

    expect((await ask(offered(COVER, 640))).status).toBe(502)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('answers Google being down with a bad gateway rather than a stack trace', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNRESET')))

    expect((await ask(offered(COVER, 640))).status).toBe(502)
  })

  it('does not pass on a picture Google refused', async () => {
    google(new Response(null, { status: 404 }))

    expect((await ask(offered(COVER, 640))).status).toBe(502)
  })

  /* An SVG served from this origin could carry script; a page is not a picture. */
  it.each(['image/svg+xml', 'text/html; charset=utf-8'])(
    'does not pass on a response that is %s',
    async (type) => {
      google(new Response('<svg/>', { headers: { 'content-type': type } }))

      expect((await ask(offered(COVER, 640))).status).toBe(502)
    },
  )
})
