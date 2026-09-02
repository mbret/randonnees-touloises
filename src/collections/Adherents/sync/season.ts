/**
 * Which season a date falls in, written the way the club writes it: `2026/2027`.
 *
 * The export carries no season column — the sheet is simply *this* season's
 * sheet, and the club renames the file. So it is derived rather than asked for,
 * on the one rule the club's own file bears out: the 2026/2027 export's payments
 * are dated from mid-August into September 2026, and its name says 20262027, so
 * a season starts in the September before the year it is named for.
 *
 * Which means importing an older file records the current season against it.
 * That is a real limitation and a deliberate one: asking on every import would
 * put a question in front of the secretary 51 weeks of the year to catch the one
 * occasion it matters, and correcting it afterwards is an edit to a single
 * adhesion row.
 */
export const seasonFor = (date: Date): string => {
  const year = date.getUTCFullYear()
  const startsThisYear = date.getUTCMonth() >= 8 // 8 = September

  return startsThisYear ? `${year}/${year + 1}` : `${year - 1}/${year}`
}
