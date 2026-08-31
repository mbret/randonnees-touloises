import type { Pin } from './mapLink'

/**
 * The four map tiles that surround a point, and where the point falls in them.
 *
 * Enough to draw a little map of one place without a map library, a key or a
 * line of client-side JavaScript: four `<img>` tags laid out 2×2 and shifted so
 * the point sits in the middle of whatever window is showing them. Leaflet does
 * the same arithmetic — this is that arithmetic and nothing else, because a
 * minimap has nothing to pan or zoom.
 *
 * The addresses are our own — `/map-tiles/…`, served by the route of that name,
 * which is the only thing here that knows OpenStreetMap exists. That is a
 * privacy decision rather than a tidiness one: tiles addressed to
 * `tile.openstreetmap.org` would have every visitor's browser announce its IP
 * address to a third party on page load, which is not what the site's privacy
 * notice says happens. See the route for the rest of it.
 */

/** OpenStreetMap serves 256 px tiles, and every offset below is in those pixels. */
const TILE_SIZE = 256

/**
 * How close in.
 *
 * A zoom is only meaningful against the size of the window showing it, and the
 * window here is 100 px — about 1.2 km across at 13, and 600 m at 14. At 14 a
 * start in Toul was a handful of streets with nothing to place them by; at 13
 * the same square holds the old town, the ring road round it and the name. That
 * is what this map is for: not navigating by, which is what the link is for,
 * but knowing which side of town, in a village or out in the fields.
 *
 * Exported because the route serving the tiles refuses every other zoom: a path
 * that answered for all twenty would be a general-purpose OpenStreetMap mirror
 * with the club's name on it, which is the one thing their usage policy asks
 * people not to build.
 */
export const TILE_ZOOM = 13

/**
 * Where a tile is asked for. One function, so the route that answers these and
 * the cards that ask for them cannot drift apart on the shape of the path.
 */
export const tilePath = (zoom: number, x: number, y: number) => `/map-tiles/${zoom}/${x}/${y}`

/** The latitudes Web Mercator can draw. Beyond them the projection runs to infinity. */
const MERCATOR_LIMIT = 85.05112878

export type MapMosaic = {
  /** The 2×2 grid of tiles, in reading order. */
  tiles: { url: string; x: number; y: number; z: number }[]
  /** The side of one tile, so the caller sizes its images from the same number. */
  tileSize: number
  /** The side of the whole mosaic. */
  size: number
  /** Where the point falls inside the mosaic, from its top-left corner. */
  left: number
  top: number
  /**
   * How much ground the mosaic is guaranteed to cover around the point, in
   * every direction. A window larger than twice this shows bare ground in a
   * corner, so it is published rather than left for a caller to rediscover.
   */
  margin: number
}

/**
 * Web Mercator, in pixels at a given zoom — the projection every raster tile
 * scheme is cut from, so `x / 256` is the tile column and the remainder is the
 * offset inside it.
 */
const project = (latitude: number, longitude: number, zoom: number) => {
  const world = TILE_SIZE * 2 ** zoom
  const clamped = Math.min(Math.max(latitude, -MERCATOR_LIMIT), MERCATOR_LIMIT)
  const sin = Math.sin((clamped * Math.PI) / 180)

  return {
    x: ((longitude + 180) / 360) * world,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * world,
  }
}

/**
 * The mosaic for a pin, or nothing if the location has no coordinates — the
 * same answer `mapUrl` gives, and for the same reason: a couple of the club's
 * meeting points are a château reached by coach and a hall whose two links
 * disagreed, and a map of the wrong place is worse than no map.
 *
 * Which four tiles is decided by rounding rather than by flooring. Floor takes
 * the tile the point is in plus its neighbours to the right and below, which
 * leaves the point hard against the mosaic's left edge whenever it sits near
 * the left of its own tile — and a window centred there would be half empty.
 * Rounding instead puts the point in the middle half of the mosaic, so there is
 * always at least half a tile of map on all four sides: 128 px, which is the
 * `margin` returned above.
 *
 * The column wraps, because the world does: a point just east of the
 * antimeridian is drawn with the tiles just west of it. Rows are not wrapped —
 * there is nothing north of the north pole — so a pin within half a tile of the
 * poles asks for a row that does not exist and gets an empty strip. The club
 * walks in Lorraine; this is a note, not a case to handle.
 */
export const mapMosaic = (
  { latitude, longitude }: Pin,
  zoom: number = TILE_ZOOM,
): MapMosaic | undefined => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return undefined

  const columns = 2 ** zoom
  const { x, y } = project(latitude, longitude, zoom)
  const firstColumn = Math.round(x / TILE_SIZE) - 1
  const firstRow = Math.round(y / TILE_SIZE) - 1

  const tiles = [0, 1].flatMap((row) =>
    [0, 1].map((column) => {
      const tileX = (((firstColumn + column) % columns) + columns) % columns
      const tileY = firstRow + row

      return { url: tilePath(zoom, tileX, tileY), x: tileX, y: tileY, z: zoom }
    }),
  )

  return {
    tiles,
    tileSize: TILE_SIZE,
    size: TILE_SIZE * 2,
    left: x - firstColumn * TILE_SIZE,
    top: y - firstRow * TILE_SIZE,
    margin: TILE_SIZE / 2,
  }
}
