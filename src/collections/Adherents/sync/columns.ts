/**
 * The columns of the club's adhérents export, exactly as its header row spells
 * them.
 *
 * Some names arrive wrapped — the export writes « Date\nnaissance » — so every
 * comparison goes through `normaliseHeader` rather than matching the literal.
 * A re-export that wraps differently, or pads a cell, still lines up; one that
 * is a *different sheet* does not, which is the point.
 */
export const SHEET_COLUMNS = [
  'Civilité',
  'Nom',
  'Prénom',
  'N°',
  'Adresse',
  'CP',
  'Ville',
  'Date\nnaissance',
  'Rattaché(e)',
  'Date\nédition',
  'Licence',
  'Club',
  'Certificat\nmédical',
  'Téléphone',
  'Mail',
  'Age',
  'Montant\nFFR',
  'Pointé',
  'Club\ncotis.',
  'Club\ncoût',
  'Paiement',
] as const

export type SheetColumn = (typeof SHEET_COLUMNS)[number]

/** Collapses the whitespace a spreadsheet export is free to move around. */
export const normaliseHeader = (header: string): string =>
  header.replace(/\s+/g, ' ').trim().toLowerCase()

/**
 * Reads a column out of a row whatever its header's wrapping, so the rest of
 * the import can name columns by the constants above.
 */
export const cell = (row: Record<string, string>, column: SheetColumn): string => {
  const wanted = normaliseHeader(column)

  for (const [key, value] of Object.entries(row)) {
    if (normaliseHeader(key) === wanted) return (value ?? '').trim()
  }

  return ''
}

/**
 * Why the whole file is refused rather than the rows that fail.
 *
 * The secretary keeps several exports, and the destructive mistake is not a bad
 * row — it is applying a different sheet to the roster. So the header has to
 * match this export and no other: every expected column present, and nothing
 * unexpected alongside them. A sheet that has gained a column is a sheet whose
 * meaning has changed, and it should reach a human, not the database.
 */
export const validateHeader = (headers: string[]): null | string => {
  const seen = headers.map(normaliseHeader).filter((header) => header !== '')
  const expected = SHEET_COLUMNS.map(normaliseHeader)

  const missing = SHEET_COLUMNS.filter((column) => !seen.includes(normaliseHeader(column)))
  const unexpected = headers
    .filter((header) => normaliseHeader(header) !== '')
    .filter((header) => !expected.includes(normaliseHeader(header)))

  if (missing.length === 0 && unexpected.length === 0) return null

  const parts: string[] = []

  if (missing.length > 0) {
    parts.push(`colonne(s) manquante(s) : ${missing.map((c) => c.replace(/\s+/g, ' ')).join(', ')}`)
  }

  if (unexpected.length > 0) {
    parts.push(`colonne(s) inattendue(s) : ${unexpected.map((c) => c.replace(/\s+/g, ' ')).join(', ')}`)
  }

  return (
    `Ce fichier ne correspond pas à l’export des adhérents (${parts.join(' ; ')}). ` +
    `Vérifiez qu’il s’agit bien du bon export avant de recommencer.`
  )
}
