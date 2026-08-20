/**
 * The calendar day an instant falls on in Toul, as `YYYY-MM-DD`.
 *
 * This is how a stored timestamp is turned back into the day an editor meant.
 * Payload's `dayOnly` picker sends midnight in the editor's own timezone, so a
 * date chosen in France is stored as 22:00 or 23:00 UTC the day before — reading
 * the ISO string's first ten characters would be a day out. Formatting the
 * instant in Paris recovers the intended day, and does so whether the value was
 * stored as Paris midnight or as UTC midnight.
 */
export const dayInFrance = (value: Date | string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date(value))

/** Today in Toul as `YYYY-MM-DD`, so past entries drop off on the right day. */
export const todayInFrance = () => dayInFrance(new Date())
