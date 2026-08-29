import { todayInFrance } from '@/utilities/parisDay'

/** What the club has said about places, as the `availability` field stores it. */
export type Availability = 'open' | 'full' | 'waitlist'

/**
 * What the club has said about joining an outing.
 *
 * Three independent facts rather than one verdict. Places and the deadline can
 * disagree — an outing fills up while its deadline is still days away, or
 * closes on time with room to spare — and who it is for has nothing to do with
 * either. Ranking them meant one of the three vanished behind another, taking
 * with it something a reader might still act on.
 *
 * `closed` is derived, never stored: a deadline passes on its own, and a field
 * an editor has to come back and tick on the right morning would be wrong most
 * mornings.
 */
export type RegistrationStatus = {
  /** Absent when there are places, which is the ordinary case and says nothing. */
  places?: Exclude<Availability, 'open'>
  /** The last day to sign up, and whether it has been and gone. */
  deadline?: { day: string; closed: boolean }
  /** Open to people who are not members — the exception worth announcing. */
  openToAll: boolean
}

/**
 * The status of an entry, or `null` when the club has said nothing worth
 * printing — an ordinary members-only outing with places and no deadline, which
 * is most of them, and which renders nothing at all.
 *
 * @param deadline `YYYY-MM-DD`, the last day an inscription is accepted
 * @param today `YYYY-MM-DD` in Toul; injectable so the boundary can be tested
 */
export const registrationStatus = (
  {
    availability,
    deadline,
    openToAll,
  }: {
    availability?: Availability | null
    deadline?: string | null
    openToAll?: boolean | null
  },
  today: string = todayInFrance(),
): RegistrationStatus | null => {
  const announced = availability && availability !== 'open' ? availability : undefined

  /* The deadline is a day someone can still sign up on, so it is closed from the
   * day after — comparing `YYYY-MM-DD` strings, which sort chronologically and
   * carry no timezone to get wrong. */
  const closed = Boolean(deadline && deadline < today)

  /* A waiting list is the one state that invites an action, and a closed
   * deadline is the club saying there is no action left. So the deadline wins
   * and the list stops being announced — someone may well still be added by
   * asking a human, but nothing here should say so in a form a machine will
   * read as « you can still sign up ».
   *
   * « Complet » outlives its deadline untouched: it invites nothing, and it
   * says more about why than a bare « closes » does. */
  const places = closed && announced === 'waitlist' ? undefined : announced

  if (!places && !deadline && !openToAll) return null

  return {
    openToAll: Boolean(openToAll),
    ...(places ? { places } : {}),
    ...(deadline ? { deadline: { day: deadline, closed } } : {}),
  }
}
