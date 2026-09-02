import { adherentName } from '../adherentName'
import { cell } from './columns'
import { mapSheetRow, sheetRenewed, type SheetAdhesion, type SheetFields } from './mapRow'
import { sheetLicence } from './values'

/**
 * An adhérent as the plan needs to see one: the fields the sheet owns, plus the
 * season rows already recorded. Deliberately a plain shape rather than the
 * generated `Adherent` type, so the whole of this file is pure and testable
 * without a database or a Payload instance.
 */
export type ExistingAdherent = {
  adhesions?: ({ id?: null | string } & SheetAdhesion)[] | null
  id: number
  licence?: null | string
  notes?: null | string
  status?: null | string
} & SheetFields

export type FieldChange = { field: string; from: unknown; to: unknown }

/**
 * `data` is the exact payload the write will hand to Payload, worked out here
 * rather than at apply time.
 *
 * The point is that the plan decides everything and the endpoint only executes:
 * whatever the report showed is literally what gets written, and both halves can
 * be asserted in a unit test without a database anywhere near them.
 */
export type PlannedCreate = {
  data: Record<string, unknown>
  fields: SheetFields
  licence: string
  line: number
  name: string
  status: string
}

export type PlannedUpdate = {
  changes: FieldChange[]
  data: Record<string, unknown>
  id: number
  licence: string
  line: number
  name: string
}

/**
 * Something worth a person's attention about a row, whatever the import does
 * with it.
 *
 * Its own section rather than a column on the writes, because a remark is about
 * the *file* and not about the change: the row whose address reads
 * « …@orange.fr ??? » may otherwise match what is stored exactly, and reporting
 * the query only when something else happens to differ would hide it on every
 * import after the first.
 */
export type Remark = { licence: string; line: number; name: string; notes: string[] }

export type SyncPlan = {
  absent: { id: number; licence: null | string; name: string }[]
  creates: PlannedCreate[]
  rejected: { line: number; reason: string }[]
  remarks: Remark[]
  season: string
  skipped: { line: number; reason: string }[]
  unchanged: number
  updates: PlannedUpdate[]
}

/** The fields an import may write, in the order the report reads best. */
const SHEET_OWNED: (keyof SheetFields)[] = [
  'civility',
  'lastName',
  'firstName',
  'birthDate',
  'email',
  'phone',
  'streetNumber',
  'address',
  'postalCode',
  'city',
  'licenceClub',
  'medicalCertificateDate',
]

/** Dates are stored as timestamps, so compare the day rather than the string. */
const sameValue = (field: keyof SheetFields, before: unknown, after: unknown): boolean => {
  if (field === 'birthDate' || field === 'medicalCertificateDate') {
    const day = (value: unknown) =>
      typeof value === 'string' && value !== '' ? value.slice(0, 10) : null

    return day(before) === day(after)
  }

  return (before ?? null) === (after ?? null)
}

/**
 * What a re-import would do, without doing any of it.
 *
 * Three rules carry the safety, and each is a decision rather than an
 * implementation detail:
 *
 *   1. The licence is the only key. A row whose licence is already here updates
 *      that adhérent; a row whose licence is new creates one; a row with no
 *      licence does nothing at all. No name matching, so there is no ambiguity
 *      to adjudicate and no chance of merging two people who share a name.
 *
 *   2. A blank cell says nothing. Only a value present in the sheet can
 *      overwrite a stored one, so a partial export cannot empty a column.
 *
 *   3. Nothing is ever deleted, and absence means nothing. An adhérent the file
 *      does not mention is reported and left exactly as they are — because the
 *      file may well be a filtered export, and "not in this file" would
 *      otherwise be indistinguishable from "no longer a member".
 *
 * What this cannot protect against is a re-import overwriting a value a member
 * changed themselves through their own account, since the sheet wins every time
 * it has an opinion. Nothing writes those fields but this import today; the sync
 * page says so in as many words, and the fix when it matters is a merge base
 * recorded per adhérent.
 */
export const buildPlan = ({
  existing,
  rows,
  season,
}: {
  existing: ExistingAdherent[]
  rows: Record<string, string>[]
  season: string
}): SyncPlan => {
  const byLicence = new Map<string, ExistingAdherent>()

  for (const adherent of existing) {
    if (adherent.licence) byLicence.set(adherent.licence, adherent)
  }

  const plan: SyncPlan = {
    absent: [],
    creates: [],
    rejected: [],
    remarks: [],
    season,
    skipped: [],
    unchanged: 0,
    updates: [],
  }

  /**
   * Licences that this file names more than once.
   *
   * Counted up front rather than caught as they recur, because rejecting only
   * the second occurrence would apply the first — which is picking one of two
   * contradictory rows, exactly what refusing them is meant to avoid. Most
   * likely a copied row, and either way it is the secretary's to resolve.
   */
  const occurrences = new Map<string, number>()

  for (const row of rows) {
    const licence = sheetLicence(cell(row, 'Licence'))

    if (licence) occurrences.set(licence, (occurrences.get(licence) ?? 0) + 1)
  }

  rows.forEach((row, index) => {
    // +2: the header is line 1, and the first row of data is line 2.
    const line = index + 2
    const mapped = mapSheetRow(row, line)

    if (mapped.outcome === 'skipped') {
      plan.skipped.push({ line, reason: mapped.reason })
      return
    }

    if (mapped.outcome === 'rejected') {
      plan.rejected.push({ line, reason: mapped.reason })
      return
    }

    if ((occurrences.get(mapped.licence) ?? 0) > 1) {
      plan.rejected.push({
        line,
        reason: `Le numéro de licence ${mapped.licence} apparaît plusieurs fois dans ce fichier.`,
      })
      return
    }

    const name = adherentName({
      firstName: mapped.fields.firstName,
      lastName: mapped.fields.lastName,
    })

    if (!mapped.fields.lastName) {
      plan.rejected.push({
        line,
        reason: `La licence ${mapped.licence} n’a pas de nom de famille.`,
      })
      return
    }

    if (mapped.notes.length > 0) {
      plan.remarks.push({ licence: mapped.licence, line, name, notes: mapped.notes })
    }

    const current = byLicence.get(mapped.licence)

    if (!current) {
      const status = sheetRenewed(row) ? 'active' : 'pending'

      plan.creates.push({
        /**
         * The person, and nothing else. `adhesions` and `notes` are hidden and
         * unwritten while what they are for is undecided — see the note on those
         * fields. `status` still comes from the same payment columns the season
         * row would have held, because that one is read.
         */
        data: {
          ...mapped.fields,
          licence: mapped.licence,
          status,
        },
        fields: mapped.fields,
        licence: mapped.licence,
        line,
        name,
        status,
      })
      return
    }

    const changes: FieldChange[] = []
    const data: Record<string, unknown> = {}

    for (const field of SHEET_OWNED) {
      const incoming = mapped.fields[field]

      // Rule 2: a blank cell is not an instruction to erase anything.
      if (incoming === undefined) continue

      if (!sameValue(field, current[field], incoming)) {
        changes.push({ field, from: current[field] ?? null, to: incoming })
        data[field] = incoming
      }
    }

    if (changes.length === 0) {
      plan.unchanged += 1
      return
    }

    plan.updates.push({
      changes,
      data,
      id: current.id,
      licence: mapped.licence,
      line,
      name: name || adherentName({ firstName: current.firstName, lastName: current.lastName }),
    })
  })

  for (const adherent of existing) {
    /**
     * Mentioned at all is enough, even if the row was refused. A licence this
     * file names twice is reported as refused; also listing the person as
     * missing from the file would read as though they had been dropped from it.
     */
    if (adherent.licence && occurrences.has(adherent.licence)) continue

    plan.absent.push({
      id: adherent.id,
      licence: adherent.licence ?? null,
      name: adherentName({ firstName: adherent.firstName, lastName: adherent.lastName }),
    })
  }

  return plan
}

/**
 * The season row is replaced wholesale when the sheet says something different
 * about it, and left alone otherwise. Earlier seasons are never touched: this
 * import only ever speaks about the one season its file covers.
 */
