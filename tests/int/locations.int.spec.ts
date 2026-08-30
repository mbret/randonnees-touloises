import { describe, expect, it } from 'vitest'

import { locationTitle } from '@/collections/Locations/locationTitle'

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
