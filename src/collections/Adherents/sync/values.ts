/**
 * Reading the club's spreadsheet conventions: French dates, French decimals,
 * money with its symbol attached.
 *
 * Every one of these returns `undefined` for a cell it cannot read, and the
 * import treats `undefined` as "the sheet says nothing here" — which is what
 * makes a blank cell leave the stored value alone instead of erasing it.
 */

/** `22/12/1952` → `1952-12-22`. Anything else — « A vérifier », `2121` — is not a date. */
export const sheetDate = (value: string): string | undefined => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim())

  if (!match) return undefined

  const [, day, month, year] = match
  const iso = `${year}-${month}-${day}`

  // Rejects 31/02 and friends: Date normalises them, so a round trip that comes
  // back changed means the sheet named a day that does not exist.
  const parsed = new Date(`${iso}T00:00:00.000Z`)

  if (Number.isNaN(parsed.getTime())) return undefined
  if (parsed.toISOString().slice(0, 10) !== iso) return undefined

  return iso
}

/** `33,00 €` → `33`. `0,00 €` → `0`, which is a value and not an absence. */
export const sheetMoney = (value: string): number | undefined => {
  const cleaned = value
    .replace(/[\s  ]/g, '')
    .replace(/€/g, '')
    .replace(',', '.')

  if (cleaned === '') return undefined

  const amount = Number(cleaned)

  return Number.isFinite(amount) ? amount : undefined
}

export const sheetCivility = (value: string): 'mme' | 'mr' | undefined => {
  const cleaned = value.trim().toLowerCase().replace(/\./g, '')

  if (cleaned === 'mme') return 'mme'
  if (cleaned === 'mr' || cleaned === 'm') return 'mr'

  return undefined
}

/**
 * Payload's own rule for the `email` field type, transcribed so this agrees with
 * the validator the write will meet. Sending an address the collection then
 * rejects fails the whole import on one bad cell.
 */
export const EMAIL_PATTERN =
  /^(?!.*\.\.)[\w!#$%&'*+/=?^`{|}~-](?:[\w!#$%&'*+/=?^`{|}~.-]*[\w!#$%&'*+/=?^`{|}~-])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i

/**
 * An address, or nothing if what is in the cell is not one.
 *
 * Lower-cased, so the same mailbox typed two ways stops reading as a change on
 * every re-import. Internal spaces are closed up because one row really is an
 * address typed with a space in the middle of it.
 *
 * But only if the result is then an address. One row of the club's export reads
 * « …@orange.fr    ??? » — the secretary querying it, not a typo — and closing
 * the gap turns that into `…@orange.fr???`, which is worse than what she wrote.
 * Anything that does not validate is left for `mapSheetRow` to report, rather
 * than repaired into something nobody meant.
 */
export const sheetEmail = (value: string): string | undefined => {
  const trimmed = value.trim().toLowerCase()

  if (trimmed === '') return undefined
  if (EMAIL_PATTERN.test(trimmed)) return trimmed

  const closed = trimmed.replace(/\s+/g, '')

  return EMAIL_PATTERN.test(closed) ? closed : undefined
}

/** The export is uniform — `06 12 34 56 78` — so this only tidies the margins. */
export const sheetPhone = (value: string): string | undefined => {
  const cleaned = value.replace(/\s+/g, ' ').trim()

  return cleaned === '' ? undefined : cleaned
}

/**
 * `rando Toul` and `Rando Toul` are one club typed twice. Collapsing case here
 * stops the difference showing up as a change to review on every import.
 */
export const sheetClub = (value: string): string | undefined => {
  const cleaned = value.replace(/\s+/g, ' ').trim()

  if (cleaned === '') return undefined

  return /^rando toul$/i.test(cleaned) ? 'Rando Toul' : cleaned
}

export const sheetText = (value: string): string | undefined => {
  const cleaned = value.replace(/\s+/g, ' ').trim()

  return cleaned === '' ? undefined : cleaned
}

/**
 * A licence is seven digits and a check letter. One value in the export is a
 * character short, having lost its leading zero somewhere — so pad rather than
 * reject, since the number is right and only its shape is wrong.
 */
export const sheetLicence = (value: string): string | undefined => {
  const cleaned = value.replace(/\s+/g, '').toUpperCase()

  if (cleaned === '') return undefined

  const padded = /^\d{6,7}[A-Z]$/.test(cleaned) ? cleaned.padStart(8, '0') : cleaned

  return padded
}
