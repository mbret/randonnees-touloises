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
  | { adhesion: SheetAdhesion; fields: SheetFields; licence: string; notes: string[]; outcome: 'mapped' }
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
export const mapSheetRow = (
  row: Record<string, string>,
  line: number,
  season: string,
): MappedRow => {
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
   * What the dropped columns leave behind rather than lose.
   *
   * `Date édition` is a batch print date and carries nothing — except on the
   * nine rows where the secretary wrote « A vérifier » or « A SUIVRE » over it,
   * all of them people who have paid. `Club coût` is used two different ways and
   * reconciles with neither of the other money columns; seven of its values
   * appear nowhere else in the sheet. Both are her handwriting about real
   * people, so they are kept as text until someone can say what they meant.
   *
   * `Certificat médical` holds three values that are not dates — a typo and two
   * cells where text has bled across — and those are worth seeing too.
   *
   * So is an address that is not one. One row reads « …@orange.fr ??? », the
   * secretary querying it rather than mistyping it, and no repair turns that
   * into a mailbox. It is reported and the field left empty — sending it would
   * have failed the collection's own validator and taken the whole import with
   * it, which is what happened the first time this ran.
   *
   * So is a `Paiement` that is not a date. One row holds the bare value `1`,
   * with no tick and no amount beside it, so it reads as `pending` here. That
   * may well be wrong — if the `1` meant "paid", the person is up to date — and
   * it is precisely the kind of thing nobody would go looking for, so it goes in
   * the report rather than being quietly resolved either way.
   */
  const notes: string[] = []
  const tel = cell(row, 'Téléphone')
  const mail = cell(row, 'Mail')
  const edition = cell(row, 'Date\nédition')
  const cost = cell(row, 'Club\ncoût')
  const certificate = cell(row, 'Certificat\nmédical')
  const payment = cell(row, 'Paiement')

  if (edition !== '' && !sheetDate(edition)) notes.push(`Date édition : ${edition}`)
  if (certificate !== '' && !sheetDate(certificate)) notes.push(`Certificat médical : ${certificate}`)
  if (payment !== '' && !sheetDate(payment)) notes.push(`Paiement illisible : ${payment}`)
  if (mail !== '' && fields.email === undefined) notes.push(`E-mail illisible : ${mail}`)
  if (tel !== '' && fields.phone === undefined) notes.push(`Pas de téléphone (${tel})`)

  const costAmount = sheetMoney(cost)

  if (costAmount !== undefined && costAmount !== 0) notes.push(`Club coût : ${cost.trim()}`)

  return {
    adhesion: {
      amountClub: sheetMoney(cell(row, 'Club\ncotis.')),
      amountFfr: sheetMoney(cell(row, 'Montant\nFFR')),
      paidOn: sheetDate(cell(row, 'Paiement')),
      season,
    },
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
