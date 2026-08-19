import type { Event } from '@/payload-types'

/**
 * One outing as the club announces it in its monthly programme.
 *
 * The day is a plain `YYYY-MM-DD` string and the times are wall-clock `HH:mm`
 * strings rather than a single instant, because that is exactly how the
 * programme is written and it keeps the whole thing out of reach of timezone
 * drift: a 08:30 departure reads 08:30 whatever the server's clock is set to,
 * and no outing can slide onto the neighbouring day across a DST change.
 */
export type AgendaOuting = {
  /** How the club names it: 'Grande', 'Nordique', 'Journée interclubs santé'… */
  title: string
  date: string
  startTime?: string
  endTime?: string
  /** Meeting point and practical details, laid out however the editor wants. */
  content?: Event['content']
}

export type AgendaDay = {
  date: string
  /**
   * 'Jeudi 20 août' — the month is repeated even though the section heading
   * above already carries it, so that someone scrolling past the heading still
   * knows which month they are looking at.
   */
  label: string
  outings: AgendaOuting[]
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

/** Today in Toul as `YYYY-MM-DD`, so past outings drop off on the right day. */
export const todayInFrance = () => dayInFrance(new Date())

/**
 * Turns a flat list of outings into the month → day → outings shape the agenda
 * renders, dropping anything before `from` and sorting by day then start time.
 *
 * Grouping is derived here rather than stored anywhere: a month is a view of
 * the dates, not a thing an editor has to create and keep in step.
 */
export const groupOutingsByMonth = (
  outings: AgendaOuting[],
  { from = todayInFrance() }: { from?: string } = {},
): AgendaMonth[] => {
  const upcoming = [...outings]
    .filter((outing) => outing.date >= from)
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? ''),
    )

  const grouped: AgendaMonth[] = []

  for (const outing of upcoming) {
    const month = outing.date.slice(0, 7)
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

    if (day?.date !== outing.date) {
      day = {
        date: outing.date,
        label: formatDay(outing.date, { weekday: 'long', day: 'numeric', month: 'long' }),
        outings: [],
      }
      section.days.push(day)
    }

    day.outings.push(outing)
  }

  return grouped
}
