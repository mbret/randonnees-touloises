import { afterEach, describe, expect, it, vi } from 'vitest'

import { GET } from '@/app/(frontend)/map-tiles/[zoom]/[x]/[y]/route'
import { TILE_ZOOM } from '@/utilities/mapTiles'

/** What the route is handed by Next, from a path like `/map-tiles/13/4229/2824`. */
const params = (zoom: string, x: string, y: string) => ({ params: Promise.resolve({ x, y, zoom }) })

const request = new Request('https://randonnees-touloises.net/map-tiles/13/4229/2824')

/** A tile server that answers, and remembers what it was asked. */
const tileServer = (
  response = new Response('png-bytes', { headers: { 'content-type': 'image/png' } }),
) => {
  const fetch = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetch)

  return fetch
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('the route that serves a map tile', () => {
  it('fetches the tile from OpenStreetMap under a name they can trace', async () => {
    const fetch = tileServer()
    const response = await GET(request, params(String(TILE_ZOOM), '4229', '2824'))

    expect(response.status).toBe(200)
    expect(fetch).toHaveBeenCalledTimes(1)

    const [url, init] = fetch.mock.calls[0]

    expect(url).toBe(`https://tile.openstreetmap.org/${TILE_ZOOM}/4229/2824.png`)
    /* Their usage policy asks for a User-Agent that identifies the caller. */
    expect(init.headers['User-Agent']).toMatch(/randonnees-touloises/)
  })

  /*
   * The whole point of the route: what the reader's browser talks to is this
   * site, and the tile server only ever hears from the server — once per tile
   * per cache window, which is what the long `s-maxage` is for.
   */
  it('lets the edge hold the tile for a long time', async () => {
    tileServer()
    const response = await GET(request, params(String(TILE_ZOOM), '4229', '2824'))

    expect(response.headers.get('cache-control')).toMatch(/public/)
    expect(response.headers.get('cache-control')).toMatch(/s-maxage=2592000/)
    expect(response.headers.get('content-type')).toBe('image/png')
  })

  /*
   * Anything the cards would never ask for is refused, so the path cannot be
   * pointed at another host, another zoom, or a tile outside the world — which
   * is what would turn it into somebody else's tile server.
   */
  it.each([
    ['another zoom', String(TILE_ZOOM + 1), '4229', '2824'],
    ['a column outside the world', String(TILE_ZOOM), String(2 ** TILE_ZOOM), '2824'],
    ['a row outside the world', String(TILE_ZOOM), '4229', String(2 ** TILE_ZOOM)],
    ['a negative column', String(TILE_ZOOM), '-1', '2824'],
    ['a fractional row', String(TILE_ZOOM), '4229', '2824.5'],
    ['something that is not a number at all', String(TILE_ZOOM), '4229', '..%2Fetc%2Fpasswd'],
  ])('refuses %s without asking anyone', async (_case, zoom, x, y) => {
    const fetch = tileServer()
    const response = await GET(request, params(zoom, x, y))

    expect(response.status).toBe(404)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('answers a tile server that is down with a bad gateway rather than a stack trace', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNRESET')))

    const response = await GET(request, params(String(TILE_ZOOM), '4229', '2824'))

    expect(response.status).toBe(502)
  })

  it('does not pass on a tile the tile server refused', async () => {
    tileServer(new Response(null, { status: 429 }))

    const response = await GET(request, params(String(TILE_ZOOM), '4229', '2824'))

    expect(response.status).toBe(502)
  })
})
