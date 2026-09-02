/**
 * A licence number is seven digits and a check letter — « 0947011C ». The whole
 * of the club's roster follows it; the one exception in the sheet is a value
 * short its leading zero rather than a different format.
 */
export const LICENCE_PATTERN = /^\d{7}[A-Z]$/

/**
 * What a licence field stores, given what was typed into it.
 *
 * An absent licence has to reach the database as `null`, never as `''`. `unique`
 * is what makes the number a dependable key for reconciling the club's sheet
 * against these rows, and Postgres lets a unique column hold any number of
 * NULLs — but `''` is a value like any other, so the second adhérent saved
 * without a licence would collide with the first.
 *
 * That is the ordinary case rather than an edge one: the sheet already carries
 * three people with no licence, and anyone joining mid-season is licence-less
 * until the FFRandonnée issues one.
 */
export const normaliseLicence = (value: unknown): unknown => {
  if (typeof value !== 'string') return value

  const trimmed = value.trim()

  return trimmed === '' ? null : trimmed
}

/**
 * Accepts a well-formed licence, and accepts none at all. Rejecting a blank here
 * would make the field required by the back door — which is the whole thing this
 * collection is careful not to do, since a person exists before their licence
 * does.
 */
export const validateLicence = (value: unknown): string | true => {
  if (value === null || value === undefined || value === '') return true

  if (typeof value === 'string' && LICENCE_PATTERN.test(value)) return true

  return 'Un numéro de licence s’écrit sept chiffres puis une lettre, par exemple 0947011C.'
}
