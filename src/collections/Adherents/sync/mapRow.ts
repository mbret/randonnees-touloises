import { LICENCE_PATTERN } from '../licence'
import { cell } from './columns'
import {
  sheetCivility,
  sheetClub,
  sheetDate,
  sheetEmail,
  sheetLicence,
  sheetMoney,
  sheetPhone,
  sheetText,
} from './values'

/**
 * The fields the sheet owns. Everything the site owns — the portrait, the three
 * publication permissions, the conseil role and rank, the animateur tick, the
 * account link — is absent by construction, so no import can reach it.
 */
export type SheetFields = {
  address?: string
  birthDate?: string
  city?: string
  civility?: 'mme' | 'mr'
  email?: string
  firstName?: string
  lastName?: string
  licenceClub?: string
  medicalCertificateDate?: string
  phone?: string
  postalCode?: string
  streetNumber?: string
}

export type SheetAdhesion = {
  amountClub?: number
  amountFfr?: number
  paidOn?: string
  season: string
}

/**
 * What reading one row produced. A tagged union rather than an optional `skip`,
 * so narrowing on `outcome` is exact — and so the two ways of not importing a
 * row stay distinct: `skipped` is a row the import has nothing to say about,
 * `rejected` is a row it refuses to guess at.
 */
export type MappedRow = { line: number } & (
  | { fields: SheetFields; licence: string; notes: string[]; outcome: 'mapped' }
  | { outcome: 'rejected'; reason: string }
  | { outcome: 'skipped'; reason: string }
)

/**
 * `Rattaché(e)` is not read. It names another adhérent in prose — « ANDERLINI
 * Isabelle » — and resolving that to a row means matching on names, which is the
 * one thing this import deliberately does not do. Households are set by hand
 * until that is a decision someone takes on purpose.
 *
 * `Age` is not read either: it is a formula over the date of birth, and a stored
 * copy would be wrong by the next birthday.
 */
export const mapSheetRow = (row: Record<string, string>, line: number): MappedRow => {
  const raw = cell(row, 'Licence')
  const licence = sheetLicence(raw)
  const named = [sheetText(cell(row, 'Nom')), sheetText(cell(row, 'Prénom'))]
    .filter(Boolean)
    .join(' ')

  if (!licence) {
    return {
      line,
      outcome: 'skipped',
      reason: `Aucun numéro de licence${named ? ` (${named})` : ''} — à saisir à la main.`,
    }
  }

  /**
   * A licence-shaped cell that is not a licence is refused here rather than
   * carried forward. `sheetLicence` only tidies and pads; deciding whether the
   * result is a licence at all belongs with the same pattern the collection
   * validates against, or the import would plan a write the collection then
   * rejects — which reports a validation failure instead of naming the bad row.
   */
  if (!LICENCE_PATTERN.test(licence)) {
    return {
      line,
      outcome: 'rejected',
      reason:
        `« ${raw} » n’est pas un numéro de licence${named ? ` (${named})` : ''} : ` +
        `il en faut sept chiffres puis une lettre.`,
    }
  }

  const fields: SheetFields = {
    address: sheetText(cell(row, 'Adresse')),
    birthDate: sheetDate(cell(row, 'Date\nnaissance')),
    city: sheetText(cell(row, 'Ville')),
    civility: sheetCivility(cell(row, 'Civilité')),
    email: sheetEmail(cell(row, 'Mail')),
    firstName: sheetText(cell(row, 'Prénom')),
    lastName: sheetText(cell(row, 'Nom')),
    licenceClub: sheetClub(cell(row, 'Club')),
    medicalCertificateDate: sheetDate(cell(row, 'Certificat\nmédical')),
    phone: sheetPhone(cell(row, 'Téléphone')),
    postalCode: sheetText(cell(row, 'CP')),
    streetNumber: sheetText(cell(row, 'N°')),
  }

  /**
   * Cells the import wanted and could not read.
   *
   * Only that. An earlier version also reported the secretary's own annotations
   * from the columns this deliberately does not model — « A vérifier » in `Date
   * édition`, the amounts in `Club coût` — and the seventeen rows whose
   * telephone reads `00 00 00 00 00`. Fifty-two entries, of which forty-six told
   * her nothing: they were her own handwriting, in her own sheet, about columns
   * already decided against, or the placeholder being understood exactly as she
   * meant it. Why those columns are not stored belongs in the comments on the
   * fields, not in a report she reads every time she imports.
   *
   * What is left is worth her attention because it says the import lost
   * something it meant to keep:
   *
   *   an address that no repair turns into a mailbox — one row reads
   *   « …@orange.fr ??? », her querying it rather than mistyping it, and sending
   *   it would fail the collection's own validator and take the whole import
   *   down, which is what happened the first time this ran;
   *
   *   a certificate date that is not a date — two cells where text has bled
   *   across, « PASS D. » and « à demander », so those certificates do not
   *   arrive. A third reads `20/09/2121`, which this cannot catch and does not
   *   try to: it is a well-formed date, and deciding that a year is too far away
   *   to be meant is a judgement for whoever keeps the certificates;
   *
   *   a `Paiement` that is not a date. One row holds the bare value `1`, with no
   *   tick and no amount beside it, so that person reads as awaiting renewal and
   *   may well be up to date. The payment itself is not imported, but whether
   *   somebody has renewed is, so this one changes what gets stored.
   */

  const notes: string[] = []
  const mail = cell(row, 'Mail')
  const certificate = cell(row, 'Certificat\nmédical')
  const payment = cell(row, 'Paiement')

  if (mail !== '' && fields.email === undefined) {
    notes.push(`E-mail non importé, illisible : ${mail}`)
  }

  if (certificate !== '' && !sheetDate(certificate)) {
    notes.push(`Certificat médical non importé, ce n’est pas une date : ${certificate}`)
  }

  if (payment !== '' && !sheetDate(payment)) {
    notes.push(`Paiement illisible (${payment}) : lu comme « renouvellement attendu »`)
  }

  return {
    fields,
    licence,
    line,
    notes,
    outcome: 'mapped',
  }
}

/**
 * Whether the sheet says this person is up to date for the season.
 *
 * The export answers that three ways — a `Pointé` tick, a payment date, an FFR
 * amount — and on the day it was first read they disagreed by 190 people,
 * because renewals arrive through the autumn. Any one of the three is taken as
 * renewed; none of them means the renewal is simply still expected, which is not
 * the same as having lapsed.
 */
export const sheetRenewed = (row: Record<string, string>): boolean => {
  const ticked = cell(row, 'Pointé').trim().toUpperCase() === 'TRUE'
  const paid = sheetDate(cell(row, 'Paiement')) !== undefined
  const charged = sheetMoney(cell(row, 'Montant\nFFR')) !== undefined

  return ticked || paid || charged
}
