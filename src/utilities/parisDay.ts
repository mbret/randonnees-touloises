import { cacheLife } from 'next/cache'

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

/**
 * The same day, readable while a page is being prerendered.
 *
 * Reading the clock is request-time work: Cache Components refuses a bare
 * `new Date()` in a prerender, because the answer would be frozen into the build
 * output. Caching it is the sanctioned way to say "one answer, shared by
 * everyone, until it expires" — and it is what lets the day stay an *argument*
 * to the cached queries below rather than something they read for themselves.
 * The day is then part of their cache key, so the first render after midnight
 * misses and queries again instead of serving yesterday's list.
 *
 * The `clock` profile is what bounds how late that is — an hour, the window the
 * home page carried before any of this. See `next.config.js` for why it is not
 * shorter.
 */
export async function cachedTodayInFrance(): Promise<string> {
  'use cache'
  cacheLife('clock')

  return todayInFrance()
}
