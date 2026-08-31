import { TILE_ZOOM } from '@/utilities/mapTiles'

/**
 * One map tile, fetched from OpenStreetMap by this server and handed on.
 *
 * The cards could name `tile.openstreetmap.org` in their `src` and be done with
 * it. What that costs is not bytes: every visitor scrolling the agenda would
 * announce their IP address, their user agent and this site as the referer to a
 * third party, without having asked for anything and before touching a link.
 * The site's privacy notice says personal data are not passed to third parties
 * — « Les données personnelles ne sont ni vendues ni cédées à des tiers » — and
 * a map that quietly did this would make that sentence untrue. The other way to
 * settle it is to rewrite the notice, which is the club's text and not a
 * developer's to edit.
 *
 * So the request is made from here instead. What reaches OpenStreetMap is this
 * server, once per tile per cache window, and nothing at all about the reader.
 *
 * It suits the tile server too. Their usage policy asks for an identifying
 * `User-Agent` and no bulk use: one named caller with a month of CDN cache in
 * front of it is a better neighbour than a browser per visitor. The zoom is
 * pinned to the one the cards draw and the coordinates must be plain numbers
 * inside the world at that zoom, so this path cannot be pointed at anything
 * else — not another host, not another kind of file, and not enough of the
 * world to be worth using as somebody else's tile server.
 */

const TILE_HOST = 'https://tile.openstreetmap.org'

/**
 * Who is asking. The club's own published address, so that a tile server with a
 * question about the traffic has somewhere to put it — which is what their
 * policy asks for, and is not something a reader's browser can offer.
 */
const USER_AGENT = 'randonnees-touloises.net (randonneestouloises@gmail.com)'

/**
 * A day in the browser, a month at the edge, and a week of serving the old copy
 * while a new one is fetched behind it.
 *
 * Tiles are re-rendered when the map data under them changes, which for a
 * village square is a matter of years, and nothing here breaks if a reader sees
 * last month's hedge. The long edge window is the point: it is what keeps this
 * route from asking OpenStreetMap the same question twice.
 */
const CACHE_CONTROL = 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800'

/** How many tiles across the world is at the zoom we serve. */
const TILE_COUNT = 2 ** TILE_ZOOM

type Args = { params: Promise<{ x: string; y: string; zoom: string }> }

/**
 * A segment that is a plain non-negative integer and nothing else — no sign, no
 * decimal point, no leading `+`, nothing `Number()` would quietly accept.
 */
const tileNumber = (value: string) => (/^\d{1,7}$/.test(value) ? Number(value) : undefined)

export const GET = async (_request: Request, { params }: Args): Promise<Response> => {
  const { x, y, zoom } = await params

  const column = tileNumber(x)
  const row = tileNumber(y)

  const asked =
    tileNumber(zoom) === TILE_ZOOM &&
    column !== undefined &&
    row !== undefined &&
    column < TILE_COUNT &&
    row < TILE_COUNT

  /* Not « bad request »: a tile that does not exist is a tile that does not
   * exist, and a 404 is also what a crawler should be told about a guessed URL. */
  if (!asked) return new Response(null, { status: 404 })

  let upstream: Response

  try {
    upstream = await fetch(`${TILE_HOST}/${TILE_ZOOM}/${column}/${row}.png`, {
      headers: { 'User-Agent': USER_AGENT },
    })
  } catch {
    /* The card is built to survive a missing tile — the square keeps the muted
     * background it was painted with — so a tile server that is down or slow
     * costs a grey corner and no log full of stack traces. */
    return new Response(null, { status: 502 })
  }

  if (!upstream.ok) return new Response(null, { status: 502 })

  return new Response(upstream.body, {
    headers: {
      'Cache-Control': CACHE_CONTROL,
      'Content-Type': upstream.headers.get('content-type') ?? 'image/png',
    },
  })
}
