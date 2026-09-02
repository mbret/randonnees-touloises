import { describe, expect, it } from 'vitest'

import { SHEET_COLUMNS } from '@/collections/Adherents/sync/columns'
import { planDigest } from '@/collections/Adherents/sync/digest'
import { buildPlan, type ExistingAdherent } from '@/collections/Adherents/sync/plan'

const SEASON = '2026/2027'

const sheetRow = (overrides: Record<string, string> = {}): Record<string, string> => {
  const row: Record<string, string> = {}
  for (const column of SHEET_COLUMNS) row[column] = ''

  return { ...row, Licence: '0947011C', Nom: 'BRET', Prénom: 'Pascal', ...overrides }
}

const stored = (overrides: Partial<ExistingAdherent> = {}): ExistingAdherent => ({
  firstName: 'Pascal',
  id: 1,
  lastName: 'BRET',
  licence: '0947011C',
  ...overrides,
})

/**
 * The fingerprint exists so that what gets applied is what somebody read. It has
 * to be stable across the two requests and to move the moment the roster does.
 */
describe('the plan fingerprint', () => {
  const rows = [sheetRow({ Téléphone: '06 12 34 56 78' })]

  it('is the same for the same file and the same roster', () => {
    const a = buildPlan({ existing: [stored()], rows, season: SEASON })
    const b = buildPlan({ existing: [stored()], rows, season: SEASON })

    expect(planDigest(a)).toBe(planDigest(b))
  })

  /** Someone else edited the adhérent while the report was being read. */
  it('changes when an adhérent has moved underneath', () => {
    const before = buildPlan({ existing: [stored()], rows, season: SEASON })
    const after = buildPlan({
      existing: [stored({ phone: '06 12 34 56 78' })],
      rows,
      season: SEASON,
    })

    expect(planDigest(before)).not.toBe(planDigest(after))
  })

  it('changes when a different adhérent appears', () => {
    const before = buildPlan({ existing: [stored()], rows, season: SEASON })
    const after = buildPlan({
      existing: [stored(), stored({ id: 2, lastName: 'MARTIN', licence: '1866501R' })],
      rows,
      season: SEASON,
    })

    expect(planDigest(before)).not.toBe(planDigest(after))
  })

  it('changes when the file changes', () => {
    const before = buildPlan({ existing: [stored()], rows, season: SEASON })
    const after = buildPlan({
      existing: [stored()],
      rows: [sheetRow({ Téléphone: '07 00 00 00 00' })],
      season: SEASON,
    })

    expect(planDigest(before)).not.toBe(planDigest(after))
  })
})
