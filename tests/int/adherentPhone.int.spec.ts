import { describe, expect, it } from 'vitest'

import { normalisePhone } from '@/collections/Adherents/phone'

describe('the telephone field', () => {
  /** The same string the import writes, so a re-import does not see a change. */
  it('stores a typed number without its separators', () => {
    expect(normalisePhone('06 15 10 59 93')).toBe('0615105993')
    expect(normalisePhone('+33 6 15 10 59 93')).toBe('+33615105993')
  })

  it('stores a blank or the placeholder as nothing', () => {
    expect(normalisePhone('')).toBeNull()
    expect(normalisePhone('   ')).toBeNull()
    expect(normalisePhone('00 00 00 00 00')).toBeNull()
  })

  it('leaves a value that is not a string alone', () => {
    expect(normalisePhone(null)).toBeNull()
    expect(normalisePhone(undefined)).toBeUndefined()
  })
})
