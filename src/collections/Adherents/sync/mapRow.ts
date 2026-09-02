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

export type MappedRow = {
  /** 1-based, counting the header, so it names the line the secretary would open. */
  line: number
} & (
  | { adhesion: SheetAdhesion; fields: SheetFields; licence: string; notes: string[] }
  | { skip: string }
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
export const mapSheetRow = (row: Record<string, string>, line: number, season: string): MappedRow => {
  const licence = sheetLicence(cell(row, 'Licence'))

  if (!licence) {
    const name = [sheetText(cell(row, 'Nom')), sheetText(cell(row, 'Prénom'))]
      .filter(Boolean)
      .join(' ')

    return {
      line,
      skip: `Aucun numéro de licence${name ? ` (${name})` : ''} — à saisir à la main.`,
    }
  }

  const fields: SheetFields = {
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
   * So is a `Paiement` that is not a date. One row holds the bare value `1`,
   * with no tick and no amount beside it, so it reads as `pending` here. That
   * may well be wrong — if the `1` meant "paid", the person is up to date — and
   * it is precisely the kind of thing nobody would go looking for, so it goes in
   * the report rather than being quietly resolved either way.
   */
  const notes: string[] = []
  const edition = cell(row, 'Date\nédition')
  const cost = cell(row, 'Club\ncoût')
  const certificate = cell(row, 'Certificat\nmédical')
  const payment = cell(row, 'Paiement')

  if (edition !== '' && !sheetDate(edition)) notes.push(`Date édition : ${edition}`)
  if (certificate !== '' && !sheetDate(certificate)) notes.push(`Certificat médical : ${certificate}`)
  if (payment !== '' && !sheetDate(payment)) notes.push(`Paiement illisible : ${payment}`)

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
