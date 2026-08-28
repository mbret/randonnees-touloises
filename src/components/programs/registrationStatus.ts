import { todayInFrance } from '@/utilities/parisDay'

/**
 * Whether a reader can still sign up, and what to say about it.
 *
 * One answer rather than two fields rendered side by side: « complet » and
 * « date limite dépassée » are both the same news to whoever is reading — you
 * have missed this one — and an entry that is full has no use for a deadline
 * that has not arrived yet. So being full wins, and only one of these ever
 * shows.
 *
 * `closed` is derived, never stored: a deadline passes on its own, and a field
 * an editor has to come back and tick on the right morning would be wrong most
 * mornings.
 */
export type RegistrationStatus =
  /** No places left, whatever the deadline said. */
  | { kind: 'full' }
  /** The deadline has been and gone. */
  | { kind: 'closed' }
  /** Still open, and the last day to sign up is known. */
  | { kind: 'open'; deadline: string }

/**
 * The status of an entry, or `null` when the club has not said anything about
 * signing up — which is most of them, and which renders nothing at all.
 *
 * @param deadline `YYYY-MM-DD`, the last day an inscription is accepted
 * @param today `YYYY-MM-DD` in Toul; injectable so the boundary can be tested
 */
export const registrationStatus = (
  { isFull, deadline }: { isFull?: boolean | null; deadline?: string | null },
  today: string = todayInFrance(),
): RegistrationStatus | null => {
  if (isFull) return { kind: 'full' }

  if (!deadline) return null

  /* The deadline is a day someone can still sign up on, so it is closed from
   * the day after — comparing `YYYY-MM-DD` strings, which sort chronologically
   * and carry no timezone to get wrong. */
  return deadline < today ? { kind: 'closed' } : { kind: 'open', deadline }
}
