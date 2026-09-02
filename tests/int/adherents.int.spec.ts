import { describe, expect, it } from 'vitest'

import { adherentName } from '@/collections/Adherents/adherentName'
import { normaliseLicence, validateLicence } from '@/collections/Adherents/licence'

describe('how an adhérent is named in the admin', () => {
  it('puts the surname first, the way the club’s own list is written', () => {
    expect(adherentName({ firstName: 'Pascal', lastName: 'BRET' })).toBe('BRET Pascal')
  })

  /** Matches the shape the sheet's `Rattaché(e)` column uses to point at a person. */
  it('reads back the form a household is typed in', () => {
    expect(adherentName({ firstName: 'Isabelle', lastName: 'ANDERLINI' })).toBe(
      'ANDERLINI Isabelle',
    )
  })

  /** One row of the club's list has a surname and nothing else. */
  it('copes with a first name that has not been filled in', () => {
    expect(adherentName({ lastName: 'BRET' })).toBe('BRET')
    expect(adherentName({ firstName: '  ', lastName: 'BRET' })).toBe('BRET')
  })

  it('trims what was typed rather than baking the spaces into the name', () => {
    expect(adherentName({ firstName: ' Pascal ', lastName: ' BRET ' })).toBe('BRET Pascal')
  })
})

describe('what a licence field stores', () => {
  /**
   * The point of the exercise: `licence` is unique, so a blank saved as `''`
   * would let exactly one adhérent exist without a licence. Postgres allows any
   * number of NULLs under the same constraint.
   */
  it('turns a blank into null so several adhérents can have no licence', () => {
    expect(normaliseLicence('')).toBeNull()
    expect(normaliseLicence('   ')).toBeNull()
  })

  it('leaves a real licence alone, minus any stray spaces', () => {
    expect(normaliseLicence('0947011C')).toBe('0947011C')
    expect(normaliseLicence(' 0947011C ')).toBe('0947011C')
  })

  it('passes through what is not a string, null included', () => {
    expect(normaliseLicence(null)).toBeNull()
    expect(normaliseLicence(undefined)).toBeUndefined()
  })

  it('accepts seven digits and a check letter', () => {
    expect(validateLicence('0947011C')).toBe(true)
    expect(validateLicence('1866501R')).toBe(true)
  })

  /** A person exists before the FFRandonnée has issued them anything. */
  it('accepts no licence at all', () => {
    expect(validateLicence(null)).toBe(true)
    expect(validateLicence(undefined)).toBe(true)
    expect(validateLicence('')).toBe(true)
  })

  it('rejects a number that is the wrong shape', () => {
    // The sheet's one malformed value: short a leading zero.
    expect(validateLicence('077439W')).toEqual(expect.any(String))
    expect(validateLicence('09470110')).toEqual(expect.any(String))
    expect(validateLicence('0947011c')).toEqual(expect.any(String))
  })
})
