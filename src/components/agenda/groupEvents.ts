import type { Event, Location, Media } from '@/payload-types'

import { todayInFrance } from '@/utilities/parisDay'

/**
 * One event as the club announces it in its monthly programme.
 *
 * The day is a plain `YYYY-MM-DD` string and the times are wall-clock `HH:mm`
 * strings rather than a single instant, because that is exactly how the
 * programme is written and it keeps the whole thing out of reach of timezone
 * drift: a 08:30 start reads 08:30 whatever the server's clock is set to,
 * and no event can slide onto the neighbouring day across a DST change.
 */
export type AgendaEvent = {
  /**
   * What the entry adds to its category: 'Marche Breathwalk', 'Assemblée
   * générale', 'interclubs'. Optional since the category carries the name of an
   * ordinary outing — 'Grande', 'Petite' — which used to be typed in here.
   */
  title?: string
  /**
   * The category's pictogram — the orange walker, the blue one, the brown
   * skier. Drawn as a finished tile with its own rounded shape on
   * transparency, so it is rendered as it comes rather than framed or masked.
   */
  logo?: Media
  date: string
  startTime?: string
  endTime?: string
  /** Whatever the entry needs to say, laid out however the editor wants. */
  content?: Event['content']
  /**
   * Where the walk starts, once it is a document rather than a line of prose.
   * Absent on an event nobody has linked yet, which the card simply omits.
   */
  startLocation?: AgendaLocation
}

/** A start location as a card shows it: the name, the pin, the parking note. */
export type AgendaLocation = Pick<Location, 'id' | 'latitude' | 'longitude' | 'notes' | 'title'>

/**
 * What to call an outing: its own intitulé, or failing that its category.
 *
 * `||` and not `??`, which is the whole point. Clearing the intitulé in the
 * admin does not store `null` — it stores an empty string, and `'' ?? 'Grande'`
 * is `''`. A « Grande » whose title had been cleared by hand therefore arrived
 * on the home page as a pictogram, a time and no name at all, while the
 * forty-two events that had never had a title fell back correctly.
 *
 * Trimmed for the same reason: a title of spaces is a title nobody typed.
 */
export const outingName = (title?: null | string, category?: string): string | undefined =>
  title?.trim() || category

export type AgendaDay = {
  date: string
  /**
   * 'Jeudi 20 août' — the month is repeated even though the section heading
   * above already carries it, so that someone scrolling past the heading still
   * knows which month they are looking at.
   */
  label: string
  events: AgendaEvent[]
}

export type AgendaMonth = {
  /** 'YYYY-MM', for keys and anchors. */
  month: string
  /** 'Août 2026' */
  label: string
  days: AgendaDay[]
}

const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

/**
 * Formats a `YYYY-MM-DD` day in French without handing the runtime any say in
 * the matter: the day is read at noon UTC — the same calendar day in every
 * timezone the club's visitors are plausibly in — and printed back in UTC.
 */
const formatDay = (date: string, options: Intl.DateTimeFormatOptions) =>
  capitalise(
    new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', ...options }).format(
      new Date(`${date}T12:00:00Z`),
    ),
  )

/**
 * Re-exported so the agenda's callers keep importing them from here; the
 * programme reads the same stored-timestamp-to-Paris-day rule.
 */
export { dayInFrance, todayInFrance } from '@/utilities/parisDay'

/**
 * Turns a flat list of events into the month → day → events shape the agenda
 * renders, dropping anything before `from` and sorting by day then start time.
 *
 * Grouping is derived here rather than stored anywhere: a month is a view of
 * the dates, not a thing an editor has to create and keep in step.
 */
export const groupEventsByMonth = (
  events: AgendaEvent[],
  { from = todayInFrance() }: { from?: string } = {},
): AgendaMonth[] => {
  const upcoming = [...events]
    .filter((event) => event.date >= from)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? ''),
    )

  const grouped: AgendaMonth[] = []

  for (const event of upcoming) {
    const month = event.date.slice(0, 7)
    let section = grouped.at(-1)

    if (section?.month !== month) {
      section = {
        month,
        label: formatDay(`${month}-01`, { month: 'long', year: 'numeric' }),
        days: [],
      }
      grouped.push(section)
    }

    let day = section.days.at(-1)

    if (day?.date !== event.date) {
      day = {
        date: event.date,
        label: formatDay(event.date, { weekday: 'long', day: 'numeric', month: 'long' }),
        events: [],
      }
      section.days.push(day)
    }

    day.events.push(event)
  }

  return grouped
}
