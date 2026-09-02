import { describe, expect, it } from 'vitest'

import { SHEET_COLUMNS, cell, validateHeader } from '@/collections/Adherents/sync/columns'
import { mapSheetRow, sheetRenewed } from '@/collections/Adherents/sync/mapRow'
import { buildPlan, type ExistingAdherent } from '@/collections/Adherents/sync/plan'
import { seasonFor } from '@/collections/Adherents/sync/season'
import {
  sheetCivility,
  sheetClub,
  sheetDate,
  sheetEmail,
  sheetLicence,
  sheetMoney,
} from '@/collections/Adherents/sync/values'

const SEASON = '2026/2027'

/** A row of the club's export, with every column present as the file has them. */
const sheetRow = (overrides: Record<string, string> = {}): Record<string, string> => {
  const row: Record<string, string> = {}
  for (const column of SHEET_COLUMNS) row[column] = ''

  return {
    ...row,
    Civilité: 'Mr',
    Licence: '0947011C',
    Nom: 'BRET',
    Prénom: 'Pascal',
    'Date\nnaissance': '22/12/1952',
    Téléphone: '06 12 34 56 78',
    Mail: 'pascal@example.net',
    Club: 'Rando Toul',
    ...overrides,
  }
}

describe('reading the club’s spreadsheet conventions', () => {
  it('reads French dates and refuses what is not one', () => {
    expect(sheetDate('22/12/1952')).toBe('1952-12-22')
    expect(sheetDate('A vérifier')).toBeUndefined()
    // The sheet's own typo, a year of 2121 aside, and a day that never existed.
    expect(sheetDate('31/02/2025')).toBeUndefined()
    expect(sheetDate('')).toBeUndefined()
  })

  it('reads money with its symbol and French decimal', () => {
    expect(sheetMoney('33,00 €')).toBe(33)
    expect(sheetMoney('30,75 €')).toBe(30.75)
    // Zero is a value, not an absence: it means the club charged nothing.
    expect(sheetMoney('0,00 €')).toBe(0)
    expect(sheetMoney('')).toBeUndefined()
  })

  it('pads the one licence that lost its leading zero', () => {
    expect(sheetLicence('077439W')).toBe('0077439W')
    expect(sheetLicence('0947011C')).toBe('0947011C')
    expect(sheetLicence('')).toBeUndefined()
  })

  it('folds the two spellings of the club into one', () => {
    expect(sheetClub('rando Toul')).toBe('Rando Toul')
    expect(sheetClub('Rando Toul')).toBe('Rando Toul')
    expect(sheetClub('Sentiers des Deuilles')).toBe('Sentiers des Deuilles')
  })

  it('repairs the address with a space in it', () => {
    expect(sheetEmail('nom prenom@example.net')).toBe('nomprenom@example.net')
    expect(sheetEmail('Nom@Example.NET')).toBe('nom@example.net')
  })

  it('reads both civilities the sheet uses', () => {
    expect(sheetCivility('Mme')).toBe('mme')
    expect(sheetCivility('Mr')).toBe('mr')
  })
})

describe('finding a column however its header is wrapped', () => {
  it('matches a header the export has broken across lines', () => {
    expect(cell({ 'Date\nnaissance': '22/12/1952' }, 'Date\nnaissance')).toBe('22/12/1952')
    expect(cell({ 'Date naissance': '22/12/1952' }, 'Date\nnaissance')).toBe('22/12/1952')
  })
})

describe('refusing the wrong file', () => {
  it('accepts the export’s own header', () => {
    expect(validateHeader([...SHEET_COLUMNS])).toBeNull()
  })

  it('accepts a re-export that wraps its headers differently', () => {
    expect(validateHeader(SHEET_COLUMNS.map((c) => c.replace(/\s+/g, ' ')))).toBeNull()
  })

  it('refuses a file missing a column', () => {
    expect(validateHeader(SHEET_COLUMNS.filter((c) => c !== 'Licence'))).toContain('Licence')
  })

  /** A sheet that has gained a column is a sheet whose meaning may have changed. */
  it('refuses a file with an extra column', () => {
    expect(validateHeader([...SHEET_COLUMNS, 'Remarques'])).toContain('Remarques')
  })

  it('refuses something that is not this export at all', () => {
    expect(validateHeader(['Name', 'Email'])).toEqual(expect.any(String))
  })
})

describe('which season a sheet belongs to', () => {
  it('opens the season on the first of September', () => {
    expect(seasonFor(new Date('2026-09-01T00:00:00Z'))).toBe('2026/2027')
    expect(seasonFor(new Date('2026-08-31T00:00:00Z'))).toBe('2025/2026')
    expect(seasonFor(new Date('2027-01-15T00:00:00Z'))).toBe('2026/2027')
  })
})

describe('what the sheet says about a renewal', () => {
  it('takes any of the three signals as renewed', () => {
    expect(sheetRenewed(sheetRow({ Pointé: 'TRUE' }))).toBe(true)
    expect(sheetRenewed(sheetRow({ Paiement: '17/08/2026' }))).toBe(true)
    expect(sheetRenewed(sheetRow({ 'Montant\nFFR': '33,00 €' }))).toBe(true)
  })

  /** Not yet reached by the secretary is not the same as lapsed. */
  it('treats silence as a renewal still expected', () => {
    expect(sheetRenewed(sheetRow({ Pointé: 'FALSE' }))).toBe(false)
  })
})

describe('mapping a row', () => {
  it('never carries a field the site owns', () => {
    const mapped = mapSheetRow(sheetRow(), 2, SEASON)

    if ('skip' in mapped) throw new Error('expected a mapped row')

    for (const forbidden of [
      'photo',
      'publicationConsent',
      'boardRole',
      'boardRank',
      'isAnimateur',
      'user',
      'household',
      'status',
      'age',
    ]) {
      expect(Object.keys(mapped.fields)).not.toContain(forbidden)
    }
  })

  it('skips a row with no licence rather than guessing who it is', () => {
    const mapped = mapSheetRow(sheetRow({ Licence: '' }), 5, SEASON)

    expect('skip' in mapped && mapped.skip).toContain('Aucun numéro de licence')
  })

  it('keeps the secretary’s marginalia from the dropped columns', () => {
    const mapped = mapSheetRow(
      sheetRow({ 'Club\ncoût': '30,75 €', 'Date\nédition': 'A vérifier' }),
      2,
      SEASON,
    )

    if ('skip' in mapped) throw new Error('expected a mapped row')

    expect(mapped.notes).toContain('Date édition : A vérifier')
    expect(mapped.notes).toContain('Club coût : 30,75 €')
  })

  it('does not note a Club coût of zero, which is what most rows hold', () => {
    const mapped = mapSheetRow(sheetRow({ 'Club\ncoût': '0,00 €' }), 2, SEASON)

    if ('skip' in mapped) throw new Error('expected a mapped row')

    expect(mapped.notes).toEqual([])
  })

  it('keeps a certificate date that is not a date', () => {
    const mapped = mapSheetRow(sheetRow({ 'Certificat\nmédical': '2121' }), 2, SEASON)

    if ('skip' in mapped) throw new Error('expected a mapped row')

    expect(mapped.fields.medicalCertificateDate).toBeUndefined()
    expect(mapped.notes).toContain('Certificat médical : 2121')
  })
})

const existing = (overrides: Partial<ExistingAdherent> = {}): ExistingAdherent => ({
  birthDate: '1952-12-22T00:00:00.000Z',
  civility: 'mr',
  email: 'pascal@example.net',
  firstName: 'Pascal',
  id: 1,
  lastName: 'BRET',
  licenceClub: 'Rando Toul',
  licence: '0947011C',
  phone: '06 12 34 56 78',
  ...overrides,
})

describe('planning a sync', () => {
  it('creates an adhérent whose licence is not here yet', () => {
    const plan = buildPlan({ existing: [], rows: [sheetRow()], season: SEASON })

    expect(plan.creates).toHaveLength(1)
    // The name is in the report so an unexpected create is visible at a glance.
    expect(plan.creates[0].name).toBe('BRET Pascal')
    expect(plan.updates).toHaveLength(0)
  })

  it('marks a create renewed or merely expected, from the sheet', () => {
    const renewed = buildPlan({ existing: [], rows: [sheetRow({ Pointé: 'TRUE' })], season: SEASON })
    const waiting = buildPlan({ existing: [], rows: [sheetRow()], season: SEASON })

    expect(renewed.creates[0].status).toBe('active')
    expect(waiting.creates[0].status).toBe('pending')
  })

  /** The acceptance test: the same file twice must be a no-op the second time. */
  it('reports nothing to do when the sheet matches what is stored', () => {
    const plan = buildPlan({ existing: [existing()], rows: [sheetRow()], season: SEASON })

    expect(plan.updates).toHaveLength(0)
    expect(plan.creates).toHaveLength(0)
    expect(plan.unchanged).toBe(1)
  })

  it('reports a change with what it was and what it becomes', () => {
    const plan = buildPlan({
      existing: [existing()],
      rows: [sheetRow({ Téléphone: '07 99 88 77 66' })],
      season: SEASON,
    })

    expect(plan.updates).toHaveLength(1)
    expect(plan.updates[0].changes).toEqual([
      { field: 'phone', from: '06 12 34 56 78', to: '07 99 88 77 66' },
    ])
  })

  /** Rule 2: a partial export must not be able to empty a column. */
  it('leaves a stored value alone when the sheet’s cell is blank', () => {
    const plan = buildPlan({
      existing: [existing()],
      rows: [sheetRow({ Mail: '', Téléphone: '' })],
      season: SEASON,
    })

    expect(plan.updates).toHaveLength(0)
    expect(plan.unchanged).toBe(1)
  })

  /** Rule 3: absence is not an instruction. */
  it('reports an adhérent the file does not mention, and plans nothing for them', () => {
    const plan = buildPlan({
      existing: [existing(), existing({ id: 2, lastName: 'MARTIN', licence: '1866501R' })],
      rows: [sheetRow()],
      season: SEASON,
    })

    expect(plan.absent).toEqual([{ id: 2, licence: '1866501R', name: 'MARTIN Pascal' }])
    expect(plan.updates).toHaveLength(0)
    expect(plan.creates).toHaveLength(0)
  })

  it('refuses a licence that appears twice in one file', () => {
    const plan = buildPlan({ existing: [], rows: [sheetRow(), sheetRow()], season: SEASON })

    expect(plan.creates).toHaveLength(1)
    expect(plan.rejected[0].reason).toContain('plusieurs fois')
    // Line 3: the header is 1, so the duplicate is the second data row.
    expect(plan.rejected[0].line).toBe(3)
  })

  it('refuses a row with a licence but no surname', () => {
    const plan = buildPlan({ existing: [], rows: [sheetRow({ Nom: '' })], season: SEASON })

    expect(plan.creates).toHaveLength(0)
    expect(plan.rejected[0].reason).toContain('nom de famille')
  })

  it('records the season’s amounts and does not touch earlier seasons', () => {
    const plan = buildPlan({
      existing: [
        existing({
          adhesions: [{ amountClub: 14, amountFfr: 33, paidOn: '2025-08-20', season: '2025/2026' }],
        }),
      ],
      rows: [sheetRow({ 'Club\ncotis.': '15,00 €', 'Montant\nFFR': '33,00 €', Paiement: '17/08/2026' })],
      season: SEASON,
    })

    expect(plan.updates).toHaveLength(1)
    expect(plan.updates[0].changes).toEqual([
      {
        field: 'adhesion 2026/2027',
        from: null,
        to: { amountClub: 15, amountFfr: 33, paidOn: '2026-08-17' },
      },
    ])
  })

  it('says nothing about a season the sheet has no amounts for', () => {
    const plan = buildPlan({ existing: [existing()], rows: [sheetRow()], season: SEASON })

    expect(plan.updates).toHaveLength(0)
  })

  it('does not re-add a note it has already written', () => {
    const row = sheetRow({ 'Date\nédition': 'A vérifier' })
    const first = buildPlan({ existing: [existing()], rows: [row], season: SEASON })

    expect(first.updates[0].notes).toEqual(['Date édition : A vérifier'])

    const second = buildPlan({
      existing: [existing({ notes: 'Date édition : A vérifier' })],
      rows: [row],
      season: SEASON,
    })

    expect(second.updates).toHaveLength(0)
    expect(second.unchanged).toBe(1)
  })
})

describe('a payment cell that is not a date', () => {
  /**
   * One row of the club's export holds the bare value `1` here, with no tick and
   * no amount beside it. It cannot be read as a payment date, so the adhérent is
   * left as a renewal still expected — and the oddity is reported rather than
   * silently decided either way.
   */
  it('does not count as renewed, and says so in the report', () => {
    const row = sheetRow({ Paiement: '1', Pointé: 'FALSE' })

    expect(sheetRenewed(row)).toBe(false)

    const mapped = mapSheetRow(row, 86, SEASON)

    if ('skip' in mapped) throw new Error('expected a mapped row')

    expect(mapped.notes).toContain('Paiement illisible : 1')
    expect(mapped.adhesion.paidOn).toBeUndefined()
  })

  it('leaves a well-formed payment date unremarked', () => {
    const mapped = mapSheetRow(sheetRow({ Paiement: '17/08/2026' }), 2, SEASON)

    if ('skip' in mapped) throw new Error('expected a mapped row')

    expect(mapped.notes).toEqual([])
    expect(mapped.adhesion.paidOn).toBe('2026-08-17')
  })
})
