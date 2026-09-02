import { describe, expect, it } from 'vitest'

import { SHEET_COLUMNS } from '@/collections/Adherents/sync/columns'
import { MAX_CSV_BYTES, parseSheet } from '@/collections/Adherents/sync/parseCsv'

/** The export's header, quoted the way a spreadsheet writes a wrapped cell. */
const header = SHEET_COLUMNS.map((column) => `"${column}"`).join(',')
const blank = SHEET_COLUMNS.map(() => '').join(',')

const withValues = (values: Partial<Record<(typeof SHEET_COLUMNS)[number], string>>) =>
  SHEET_COLUMNS.map((column) => values[column] ?? '').join(',')

describe('reading the export as a file', () => {
  it('reads a header whose cells wrap across lines', () => {
    const parsed = parseSheet(`${header}\n${withValues({ Licence: '0947011C', Nom: 'BRET' })}\n`)

    if (!parsed.ok) throw new Error(parsed.error)

    expect(parsed.rows).toHaveLength(1)
    // The header cell really does contain a newline in the club's file.
    expect(parsed.rows[0]['Date\nnaissance']).toBe('')
    expect(parsed.rows[0].Licence).toBe('0947011C')
  })

  /** The file ends with a newline; that trailing line is not a member. */
  it('does not read the trailing newline as an empty member', () => {
    const parsed = parseSheet(`${header}\n${withValues({ Licence: '0947011C', Nom: 'BRET' })}\n\n`)

    if (!parsed.ok) throw new Error(parsed.error)

    expect(parsed.rows).toHaveLength(1)
  })

  it('refuses an empty file', () => {
    expect(parseSheet('')).toMatchObject({ ok: false })
    expect(parseSheet('   \n')).toMatchObject({ ok: false })
  })

  it('refuses a file that is not this export', () => {
    const parsed = parseSheet('Name,Email\nAlice,a@example.net\n')

    expect(parsed.ok).toBe(false)
    expect(!parsed.ok && parsed.error).toContain('ne correspond pas')
  })

  /**
   * Importing the readable part of a structurally broken file is how a truncated
   * download becomes a hundred silent changes.
   */
  it('refuses a file whose rows do not match the header', () => {
    const parsed = parseSheet(`${header}\n${blank},extra\n`)

    expect(parsed.ok).toBe(false)
    expect(!parsed.ok && parsed.error).toContain('colonnes')
  })

  it('accepts a value carrying a comma inside quotes', () => {
    const row = SHEET_COLUMNS.map((column) =>
      column === 'Adresse' ? '"12, rue des Cordeliers"' : column === 'Licence' ? '0947011C' : '',
    ).join(',')

    const parsed = parseSheet(`${header}\n${row}\n`)

    if (!parsed.ok) throw new Error(parsed.error)

    expect(parsed.rows[0].Adresse).toBe('12, rue des Cordeliers')
  })

  it('caps the file at a size no roster would reach', () => {
    // The club's real export is 51 KB.
    expect(MAX_CSV_BYTES).toBeGreaterThan(51_000 * 4)
  })
})
