import Papa from 'papaparse'

import { validateHeader } from './columns'

/**
 * The club's export is a hand-kept spreadsheet saved to CSV, which is why this
 * goes through a real parser rather than splitting on commas: its header wraps
 * inside quoted fields, so the first record spans several physical lines.
 *
 * The file is read and thrown away. It is never written to disk and never stored
 * in the media collection — that one is publicly readable, and this file carries
 * 276 people's home addresses and dates of birth.
 */
export type ParsedSheet =
  | { error: string; ok: false }
  | { ok: true; rows: Record<string, string>[] }

/**
 * Large enough for the club's roster several times over, small enough that a
 * mis-picked file cannot occupy the function for long. The real export is 51 KB.
 */
export const MAX_CSV_BYTES = 2_000_000

export const parseSheet = (csv: string): ParsedSheet => {
  if (csv.trim() === '') return { error: 'Le fichier est vide.', ok: false }

  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    // The export's last line is a newline; without this it becomes a row of
    // empty strings that then reads as a row with no licence.
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim(),
  })

  const headers = parsed.meta.fields ?? []
  const headerError = validateHeader(headers)

  if (headerError) return { error: headerError, ok: false }

  /**
   * Papaparse reports a malformed quote or a row whose field count does not match
   * the header as an error while still returning what it could read. Importing
   * the readable part of a file that is structurally wrong is how a truncated
   * download becomes a hundred silent changes, so the whole file goes back.
   */
  const structural = parsed.errors.filter((error) => error.type !== 'FieldMismatch')

  if (structural.length > 0) {
    const first = structural[0]

    return {
      error:
        `Le fichier n’a pas pu être lu (${first.message}` +
        `${typeof first.row === 'number' ? `, ligne ${first.row + 2}` : ''}).`,
      ok: false,
    }
  }

  const mismatched = parsed.errors.filter((error) => error.type === 'FieldMismatch')

  if (mismatched.length > 0) {
    const lines = mismatched
      .map((error) => (typeof error.row === 'number' ? error.row + 2 : null))
      .filter((line): line is number => line !== null)
      .slice(0, 5)

    return {
      error:
        `Certaines lignes n’ont pas le bon nombre de colonnes ` +
        `(ligne${lines.length > 1 ? 's' : ''} ${lines.join(', ')}` +
        `${mismatched.length > lines.length ? '…' : ''}). ` +
        `Réenregistrez l’export sans le modifier à la main.`,
      ok: false,
    }
  }

  return { ok: true, rows: parsed.data }
}
