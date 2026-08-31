import { describe, expect, it } from 'vitest'

import { mapMosaic } from '@/utilities/mapTiles'

/** Where the club's office is, near enough: rue de la Comédie, Toul. */
const TOUL = { latitude: 48.6752, longitude: 5.8919 }

describe('the tiles a minimap is drawn from', () => {
  it('has nothing to draw for a location without coordinates', () => {
    expect(mapMosaic({ latitude: null, longitude: null })).toBeUndefined()
    expect(mapMosaic({ latitude: 48.6752, longitude: null })).toBeUndefined()
    expect(mapMosaic({})).toBeUndefined()
  })

  it('asks OpenStreetMap for four neighbouring tiles at the requested zoom', () => {
    const mosaic = mapMosaic(TOUL, 14)!

    expect(mosaic.tiles.map((tile) => tile.url)).toEqual([
      'https://tile.openstreetmap.org/14/8459/5648.png',
      'https://tile.openstreetmap.org/14/8460/5648.png',
      'https://tile.openstreetmap.org/14/8459/5649.png',
      'https://tile.openstreetmap.org/14/8460/5649.png',
    ])
  })

  /*
   * The point of the whole exercise. The window is a fixed square with the pin
   * drawn dead centre, so the tiles have to be shifted under it by exactly where
   * the point falls in them — and they have to reach past the window's edges in
   * every direction, whatever fraction of a tile the point happens to sit at.
   */
  it('always leaves at least half a tile of map on every side of the point', () => {
    // A degree of longitude at this latitude is a good few tiles wide at z14, so
    // stepping across two of them walks the point through every offset a tile has.
    for (let step = 0; step <= 200; step++) {
      const mosaic = mapMosaic(
        { latitude: TOUL.latitude + step / 400, longitude: TOUL.longitude + step / 200 },
        14,
      )!

      expect(mosaic.left).toBeGreaterThanOrEqual(mosaic.margin)
      expect(mosaic.top).toBeGreaterThanOrEqual(mosaic.margin)
      expect(mosaic.size - mosaic.left).toBeGreaterThanOrEqual(mosaic.margin)
      expect(mosaic.size - mosaic.top).toBeGreaterThanOrEqual(mosaic.margin)
    }
  })

  it('places the point in the tile that contains it', () => {
    const mosaic = mapMosaic(TOUL, 14)!

    // The offset inside the mosaic, taken back to a global pixel address, has to
    // land in the tile the mosaic starts from.
    const [first] = mosaic.tiles

    expect(Math.floor((first.x * mosaic.tileSize + mosaic.left) / mosaic.tileSize)).toBe(
      Math.floor(((TOUL.longitude + 180) / 360) * 2 ** 14),
    )
  })

  /*
   * Nothing the club does goes near either of these, but the arithmetic is the
   * kind that returns `NaN` or a negative tile column rather than an obviously
   * wrong map, so both ends are pinned down here.
   */
  it('wraps the column round the antimeridian rather than asking for a tile that cannot exist', () => {
    const mosaic = mapMosaic({ latitude: 0, longitude: 179.999 }, 4)!

    expect(mosaic.tiles.map((tile) => tile.x)).toEqual([15, 0, 15, 0])
    expect(mosaic.tiles.every((tile) => tile.y >= 0)).toBe(true)
  })

  it('keeps a pole inside the projection', () => {
    const mosaic = mapMosaic({ latitude: 90, longitude: 0 }, 4)!

    expect(mosaic.tiles.every((tile) => Number.isFinite(tile.y))).toBe(true)
    expect(Number.isFinite(mosaic.top)).toBe(true)
  })
})
