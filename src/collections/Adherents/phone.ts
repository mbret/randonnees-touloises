import { sheetPhone } from './sync/values'

/**
 * What the telephone field stores, given what was typed into it: the same
 * separator-free string the import writes, so a number reads one way whoever
 * entered it — the import, the secretary in the admin, or the member in their
 * espace adhérent.
 *
 * Without this, a number typed `06 15 10 59 93` never equals the `0615105993`
 * the sheet gives, and every re-import lists it as a change.
 *
 * A blank, or the `00 00 00 00 00` placeholder, is stored as `null`.
 */
export const normalisePhone = (value: unknown): unknown => {
  if (typeof value !== 'string') return value

  return sheetPhone(value) ?? null
}
