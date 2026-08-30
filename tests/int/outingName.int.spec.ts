import { describe, expect, it } from 'vitest'

import { outingName } from '@/components/agenda/groupEvents'

describe('what to call an outing on the agenda', () => {
  it('prefers the intitulé the club typed', () => {
    expect(outingName('Journée interclubs santé', 'Santé')).toBe('Journée interclubs santé')
  })

  it('falls back to the category for an ordinary walk', () => {
    expect(outingName(null, 'Grande')).toBe('Grande')
    expect(outingName(undefined, 'Petite')).toBe('Petite')
  })

  /**
   * The one that got through. Clearing the intitulé in the admin stores an
   * empty string rather than `null`, and `'' ?? 'Grande'` is `''` — so a
   * « Grande » whose title had been cleared by hand arrived on the home page
   * as a pictogram, a time and no name at all.
   */
  it('falls back when the intitulé was cleared rather than never set', () => {
    expect(outingName('', 'Grande')).toBe('Grande')
  })

  it('treats a title of spaces as no title', () => {
    expect(outingName('   ', 'Nordique')).toBe('Nordique')
  })

  it('has nothing to say when there is neither', () => {
    expect(outingName('', undefined)).toBeUndefined()
    expect(outingName(null, undefined)).toBeUndefined()
  })
})
