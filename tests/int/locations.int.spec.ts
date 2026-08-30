import { describe, expect, it } from 'vitest'

import { locationTitle } from '@/collections/Locations/locationTitle'
import { parseCoordinates } from '@/utilities/mapCoordinates'

describe('how a start location is named', () => {
  it('reads as the club has always printed it', () => {
    expect(locationTitle({ commune: 'Boucq', spot: 'terrain de foot' })).toBe(
      'Boucq (terrain de foot)',
    )
  })

  /** « Lac du Der », « Le Bonhomme » — a destination with nothing to add. */
  it('leaves out the brackets when there is no spot', () => {
    expect(locationTitle({ commune: 'Lac du Der' })).toBe('Lac du Der')
    expect(locationTitle({ commune: 'Lac du Der', spot: '  ' })).toBe('Lac du Der')
  })

  it('trims what was typed rather than baking the spaces into the title', () => {
    expect(locationTitle({ commune: ' Gye ', spot: ' Mairie ' })).toBe('Gye (Mairie)')
  })
})

describe('finding the pin in what someone pasted', () => {
  /**
   * The four shapes the club's own agenda actually holds, taken from the links
   * printed against real events.
   */
  it('reads a resolved coordinate search', () => {
    expect(
      parseCoordinates('https://www.google.com/maps/search/48.742468,+5.758898?entry=tts'),
    ).toEqual({ latitude: 48.742468, longitude: 5.758898 })
  })

  it('reads the marker of a place link, not the camera', () => {
    const streetView =
      'https://www.google.com/maps/place/Mairie+de+Choloy-Menillot/@48.6629045,5.8150213,3a,75y,' +
      '64.47h,99.58t/data=!3m7!1e1!4m7!3m6!1s0x4794ac85e32d228f:0x7fdaed0695ed02d0!8m2!3d48.6630806!4d5.8156334'

    /* `@48.6629045,5.8150213` is where the photograph was taken from — about
     * twenty-five metres from the mairie it is a picture of. */
    expect(parseCoordinates(streetView)).toEqual({ latitude: 48.6630806, longitude: 5.8156334 })
  })

  it('falls back to the camera when a link carries no marker', () => {
    expect(parseCoordinates('https://www.google.com/maps/@48.6629045,5.8150213,17z')).toEqual({
      latitude: 48.6629045,
      longitude: 5.8150213,
    })
  })

  it('reads a pair typed straight in', () => {
    expect(parseCoordinates('48.742468, 5.758898')).toEqual({
      latitude: 48.742468,
      longitude: 5.758898,
    })
  })

  it('reads what a phone shares', () => {
    expect(parseCoordinates('geo:48.742468,5.758898')).toEqual({
      latitude: 48.742468,
      longitude: 5.758898,
    })
  })

  it('reads an explicit query parameter ahead of anything positional', () => {
    expect(
      parseCoordinates('https://www.google.com/maps/@1.0,2.0,17z?q=48.742468,5.758898'),
    ).toEqual({ latitude: 48.742468, longitude: 5.758898 })
  })

  it('finds nothing in a link that never resolved', () => {
    expect(parseCoordinates('https://maps.app.goo.gl/1fhbP7SyeCEiAhLe8')).toBeNull()
    expect(parseCoordinates('')).toBeNull()
    expect(parseCoordinates(null)).toBeNull()
    expect(parseCoordinates('BOUCQ (terrain de foot)')).toBeNull()
  })

  /** A swapped or truncated paste is worse than no pin: it renders somewhere. */
  it('refuses a pair that is not a place on Earth', () => {
    expect(parseCoordinates('148.742468, 5.758898')).toBeNull()
    expect(parseCoordinates('48.742468, 258.758898')).toBeNull()
  })
})
