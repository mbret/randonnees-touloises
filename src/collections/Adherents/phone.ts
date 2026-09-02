/**
 * Everything a person might put between the digits of a telephone number:
 * ordinary spaces, the non-breaking and narrow kinds a spreadsheet inserts,
 * dots, the several dashes, slashes, brackets, middots.
 */
const SEPARATORS = /[\s  .•·()[\]/\\_+-]/g

/**
 * A telephone number as it should be stored: a string, formatted one way.
 *
 * A string and not digits, because `+33 6 15 10 59 93` is the same number as
 * `06 15 10 59 93` and only one of them survives being reduced to digits — the
 * leading `+` carries meaning that a numeric column cannot.
 *
 * Formatted one way, because the alternative is churn. The club's export writes
 * every number as five pairs, but a member typing theirs into their own account
 * writes `06.15.10.59.93` or `0615105993` as the mood takes them, and each of
 * those would then read as a change on every re-import — the sync offering to
 * "correct" a number to itself, over and over.
 *
 * The number's *form* is left alone: a number written internationally stays
 * international, because that is what its owner chose to publish. Only the
 * spacing is decided here.
 *
 * Anything that is not a French number of a shape this recognises — a Belgian
 * mobile, a nine-digit landline typed short — keeps its digits and loses only
 * its punctuation. Guessing at the grouping of a number we cannot identify would
 * make it less readable, not more.
 */
export const normalisePhone = (value: string): null | string => {
  const trimmed = value.replace(/\s+/g, ' ').trim()

  if (trimmed === '') return null

  const digits = trimmed.replace(SEPARATORS, '')

  /**
   * `+33 6 …`, or the same number written `0033 6 …`. Matched on the digits
   * alone — the `+` is a separator and has already gone — which is unambiguous
   * because a French national number always starts with a `0`, so eleven digits
   * beginning `33` can only be the country code.
   */
  const international = /^(?:33|0033)([1-9]\d{8})$/.exec(digits)

  if (international) {
    const national = international[1]

    return `+33 ${national[0]} ${pairs(national.slice(1))}`
  }

  // `06 …`, `03 …` — ten digits, and the second one says which kind of line.
  if (/^0[1-9]\d{8}$/.test(digits)) {
    return `${digits.slice(0, 2)} ${pairs(digits.slice(2))}`
  }

  /**
   * Not a French number of a shape this recognises — a foreign one, a
   * nine-digit landline typed short, or the club's own `00 00 00 00 00` for "no
   * number at all". Left exactly as it was written, minus any doubled spaces.
   *
   * Being sure before rewriting matters more than being tidy. An earlier version
   * of this treated a leading `00` as the international prefix, which turned all
   * seventeen of those placeholders into `+0000000000` — a worse string than the
   * one the secretary typed, and one that looks like a telephone number.
   */
  return trimmed
}

/** `1510 5993` → `15 10 59 93`. */
const pairs = (digits: string): string => (digits.match(/\d{2}/g) ?? []).join(' ')
