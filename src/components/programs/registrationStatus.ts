import { todayInFrance } from '@/utilities/parisDay'

/**
 * What the club has said about signing up.
 *
 * Two facts rather than one verdict, because they are independent: an outing
 * can fill up while its deadline is still days away, and one that never filled
 * can simply close. Ranking them meant the deadline vanished the moment
 * « Complet » was ticked, taking with it the one date on the card a reader
 * might still act on.
 *
 * `closed` is derived, never stored: a deadline passes on its own, and a field
 * an editor has to come back and tick on the right morning would be wrong most
 * mornings.
 */
export type RegistrationStatus = {
  /** No places left, whatever the deadline says. */
  full: boolean
  /** The last day to sign up, and whether it has been and gone. */
  deadline?: { day: string; closed: boolean }
}

/**
 * The status of an entry, or `null` when the club has said nothing about
 * signing up — which is most of them, and which renders nothing at all.
 *
 * @param deadline `YYYY-MM-DD`, the last day an inscription is accepted
 * @param today `YYYY-MM-DD` in Toul; injectable so the boundary can be tested
 */
export const registrationStatus = (
  { isFull, deadline }: { isFull?: boolean | null; deadline?: string | null },
  today: string = todayInFrance(),
): RegistrationStatus | null => {
  if (!isFull && !deadline) return null

  return {
    full: Boolean(isFull),
    /* The deadline is a day someone can still sign up on, so it is closed from
     * the day after — comparing `YYYY-MM-DD` strings, which sort
     * chronologically and carry no timezone to get wrong. */
    ...(deadline ? { deadline: { day: deadline, closed: deadline < today } } : {}),
  }
}
