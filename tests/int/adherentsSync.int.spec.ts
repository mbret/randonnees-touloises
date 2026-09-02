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
  sheetPhone,
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
    const mapped = mapSheetRow(sheetRow(), 2)

    if (mapped.outcome !== 'mapped') throw new Error('expected a mapped row')

    for (const forbidden of [
      'photo',
      'publicationConsent',
      'boardRole',
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
    const mapped = mapSheetRow(sheetRow({ Licence: '' }), 5)

    expect(mapped.outcome).toBe('skipped')
    expect(mapped.outcome === 'skipped' && mapped.reason).toContain('Aucun numéro de licence')
  })

  /**
   * The dropped columns are dropped, annotations and all. Why they are not
   * stored is in the comments on the fields; repeating it in a report the
   * secretary reads on every import told her nothing she had not written
   * herself.
   */
  it('says nothing about the columns it does not model', () => {
    const mapped = mapSheetRow(
      sheetRow({ 'Club\ncoût': '30,75 €', 'Date\nédition': 'A vérifier' }),
      2,
    )

    if (mapped.outcome !== 'mapped') throw new Error('expected a mapped row')

    expect(mapped.notes).toEqual([])
  })

  it('does not note a Club coût of zero, which is what most rows hold', () => {
    const mapped = mapSheetRow(sheetRow({ 'Club\ncoût': '0,00 €' }), 2)

    if (mapped.outcome !== 'mapped') throw new Error('expected a mapped row')

    expect(mapped.notes).toEqual([])
  })

  it('keeps a certificate date that is not a date', () => {
    const mapped = mapSheetRow(sheetRow({ 'Certificat\nmédical': '2121' }), 2)

    if (mapped.outcome !== 'mapped') throw new Error('expected a mapped row')

    expect(mapped.fields.medicalCertificateDate).toBeUndefined()
    expect(mapped.notes[0]).toContain('Certificat médical non importé')
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
  phone: '0612345678',
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
      { field: 'phone', from: '0612345678', to: '0799887766' },
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

  it('refuses a row with a licence but no surname', () => {
    const plan = buildPlan({ existing: [], rows: [sheetRow({ Nom: '' })], season: SEASON })

    expect(plan.creates).toHaveLength(0)
    expect(plan.rejected[0].reason).toContain('nom de famille')
  })

  it('says nothing about a season the sheet has no amounts for', () => {
    const plan = buildPlan({ existing: [existing()], rows: [sheetRow()], season: SEASON })

    expect(plan.updates).toHaveLength(0)
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

    const mapped = mapSheetRow(row, 86)

    if (mapped.outcome !== 'mapped') throw new Error('expected a mapped row')

    // The payment itself is not imported, but whether somebody renewed is —
    // which is what this cell being unreadable actually costs.
    expect(mapped.notes[0]).toContain('Paiement illisible (1)')
    expect(mapped.notes[0]).toContain('renouvellement attendu')
  })

  it('leaves a well-formed payment date unremarked', () => {
    const mapped = mapSheetRow(sheetRow({ Paiement: '17/08/2026' }), 2)

    if (mapped.outcome !== 'mapped') throw new Error('expected a mapped row')

    expect(mapped.notes).toEqual([])
    expect(sheetRenewed(sheetRow({ Paiement: '17/08/2026' }))).toBe(true)
  })
})

describe('the street address', () => {
  /**
   * 275 of the club's 276 rows carry one, and an earlier version of this mapping
   * read the number, the postcode and the town but never the street itself.
   */
  it('is read, along with the rest of the address', () => {
    const mapped = mapSheetRow(
      sheetRow({ Adresse: 'rue des Cordeliers', CP: '54200', 'N°': '12', Ville: 'TOUL' }),
      2,
    )

    if (mapped.outcome !== 'mapped') throw new Error('expected a mapped row')

    expect(mapped.fields.address).toBe('rue des Cordeliers')
    expect(mapped.fields.streetNumber).toBe('12')
    expect(mapped.fields.postalCode).toBe('54200')
    expect(mapped.fields.city).toBe('TOUL')
  })

  it('is offered as a change like any other sheet-owned field', () => {
    const plan = buildPlan({
      existing: [existing({ address: 'rue de la Halle' })],
      rows: [sheetRow({ Adresse: 'rue des Cordeliers' })],
      season: SEASON,
    })

    expect(plan.updates[0].changes).toEqual([
      { field: 'address', from: 'rue de la Halle', to: 'rue des Cordeliers' },
    ])
  })
})

describe('a licence that is not a licence', () => {
  it('is refused by name rather than carried into a write the collection rejects', () => {
    const plan = buildPlan({ existing: [], rows: [sheetRow({ Licence: 'A VOIR' })], season: SEASON })

    expect(plan.creates).toHaveLength(0)
    expect(plan.skipped).toHaveLength(0)
    expect(plan.rejected[0].reason).toContain('A VOIR')
  })

  /** The sheet's one short value is a lost leading zero, not a malformed licence. */
  it('still pads the value that only lost its leading zero', () => {
    const plan = buildPlan({ existing: [], rows: [sheetRow({ Licence: '077439W' })], season: SEASON })

    expect(plan.rejected).toHaveLength(0)
    expect(plan.creates[0].licence).toBe('0077439W')
  })
})

describe('a licence the file names twice', () => {
  /**
   * Both occurrences go, not just the second. Rejecting the later one would
   * apply the earlier — which is choosing between two contradictory rows, the
   * thing refusing them is supposed to avoid.
   */
  it('rejects every occurrence and plans nothing for that person', () => {
    const plan = buildPlan({
      existing: [],
      rows: [sheetRow({ Téléphone: '06 00 00 00 01' }), sheetRow({ Téléphone: '06 00 00 00 02' })],
      season: SEASON,
    })

    expect(plan.creates).toHaveLength(0)
    expect(plan.updates).toHaveLength(0)
    expect(plan.rejected).toHaveLength(2)
    expect(plan.rejected.map((r) => r.line)).toEqual([2, 3])
  })

  it('does not touch an adhérent already stored under that licence', () => {
    const plan = buildPlan({
      existing: [existing()],
      rows: [sheetRow({ Téléphone: '06 00 00 00 01' }), sheetRow({ Téléphone: '06 00 00 00 02' })],
      season: SEASON,
    })

    expect(plan.updates).toHaveLength(0)
    expect(plan.rejected).toHaveLength(2)
    // Refused rather than reported as missing from the file: it is in the file, twice.
    expect(plan.absent).toHaveLength(0)
  })
})

describe('the write each plan carries', () => {
  /**
   * The plan decides everything, including the exact payload, so that what gets
   * written is what the report showed and both can be asserted here.
   */
  it('gives a create everything the collection needs', () => {
    const plan = buildPlan({
      existing: [],
      rows: [
        sheetRow({
          Adresse: 'rue des Cordeliers',
          'Club\ncotis.': '15,00 €',
          CP: '54200',
          'Montant\nFFR': '33,00 €',
          'N°': '12',
          Paiement: '17/08/2026',
          Ville: 'TOUL',
        }),
      ],
      season: SEASON,
    })

    expect(plan.creates[0].data).toEqual({
      address: 'rue des Cordeliers',
      birthDate: '1952-12-22',
      city: 'TOUL',
      civility: 'mr',
      email: 'pascal@example.net',
      firstName: 'Pascal',
      lastName: 'BRET',
      licence: '0947011C',
      licenceClub: 'Rando Toul',
      medicalCertificateDate: undefined,
      phone: '0612345678',
      postalCode: '54200',
      status: 'active',
      streetNumber: '12',
    })
  })

  it('gives an update only the fields that changed', () => {
    const plan = buildPlan({
      existing: [existing()],
      rows: [sheetRow({ Téléphone: '07 99 88 77 66' })],
      season: SEASON,
    })

    expect(plan.updates[0].data).toEqual({ phone: '0799887766' })
  })

  /**
   * Payload replaces an array field wholesale, so an update that touches one
   * season has to send the others back untouched or they are dropped.
   */
  /** Row ids are per-write; sending them back with reordered content edits the wrong row. */
})

describe('an address the collection would refuse', () => {
  /**
   * What broke the first real import: one row of the club's export reads
   * « …@orange.fr    ??? ». Closing up the spaces made `…@orange.fr???`, which
   * Payload's `email` field rejected, and the whole import failed on it.
   */
  it('is left empty and reported rather than repaired into nonsense', () => {
    const mapped = mapSheetRow(sheetRow({ Mail: 'renee@orange.fr    ???' }), 77)

    if (mapped.outcome !== 'mapped') throw new Error('expected a mapped row')

    expect(mapped.fields.email).toBeUndefined()
    expect(mapped.notes).toContain('E-mail non importé, illisible : renee@orange.fr    ???')
  })

  /** The genuine typo — a space inside the address — is still closed up. */
  it('still repairs an address typed with a space in the middle', () => {
    const mapped = mapSheetRow(sheetRow({ Mail: 'nom prenom@example.net' }), 2)

    if (mapped.outcome !== 'mapped') throw new Error('expected a mapped row')

    expect(mapped.fields.email).toBe('nomprenom@example.net')
    expect(mapped.notes).toEqual([])
  })

  it('never plans a write carrying an address that would be rejected', () => {
    const plan = buildPlan({
      existing: [],
      rows: [sheetRow({ Mail: 'pas une adresse' })],
      season: SEASON,
    })

    expect(plan.creates[0].data).not.toHaveProperty('email', 'pas une adresse')
    expect(plan.creates[0].data.email).toBeUndefined()
  })

  it('leaves a stored address alone when the sheet’s is unusable', () => {
    const plan = buildPlan({
      existing: [existing()],
      rows: [sheetRow({ Mail: 'renee@orange.fr ???' })],
      season: SEASON,
    })

    // Rule 2: an unreadable cell says nothing, so it cannot erase what is there.
    expect(plan.updates).toHaveLength(0)
    expect(plan.unchanged).toBe(1)
  })

  /**
   * And the query still reaches the report. A remark is about the file, so it
   * cannot depend on the row also having something to write — this row matches
   * what is stored in every other respect.
   */
  it('reports the query even when there is nothing to change', () => {
    const plan = buildPlan({
      existing: [existing()],
      rows: [sheetRow({ Mail: 'renee@orange.fr ???' })],
      season: SEASON,
    })

    expect(plan.remarks).toEqual([
      {
        licence: '0947011C',
        line: 2,
        name: 'BRET Pascal',
        notes: ['E-mail non importé, illisible : renee@orange.fr ???'],
      },
    ])
  })
})

describe('reading a telephone number', () => {
  /** Stored as a string with its separators taken out, and nothing else done. */
  it('takes the separators out and leaves the digits', () => {
    expect(sheetPhone('06 15 10 59 93')).toBe('0615105993')
    expect(sheetPhone('06.15.10.59.93')).toBe('0615105993')
    expect(sheetPhone('06-15-10-59-93')).toBe('0615105993')
  })

  /** A string and not digits, so that the international form survives at all. */
  it('keeps the plus of an international number', () => {
    expect(sheetPhone('+33 6 15 10 59 93')).toBe('+33615105993')
    expect(sheetPhone('+32 475 12 34 56')).toBe('+32475123456')
  })

  it('reads an empty cell as nothing', () => {
    expect(sheetPhone('')).toBeUndefined()
    expect(sheetPhone('   ')).toBeUndefined()
  })
})

describe('the « no number » placeholder', () => {
  it('is not imported as a telephone number', () => {
    const plan = buildPlan({
      existing: [],
      rows: [sheetRow({ Téléphone: '00 00 00 00 00' })],
      season: SEASON,
    })

    expect(plan.creates[0].data.phone).toBeUndefined()
  })

  /**
   * And is not remarked on. It is the sheet's own way of writing "none", read
   * exactly as meant — not a cell the import failed on, which is what the
   * remarks are for.
   */
  it('is not reported as a problem, because it is not one', () => {
    const plan = buildPlan({
      existing: [],
      rows: [sheetRow({ Téléphone: '00 00 00 00 00' })],
      season: SEASON,
    })

    expect(plan.remarks).toHaveLength(0)
  })
})
