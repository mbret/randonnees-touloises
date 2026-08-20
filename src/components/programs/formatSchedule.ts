/**
 * A `YYYY-MM-DD` day in French, read at noon UTC and printed back in UTC so no
 * runtime timezone can slide it onto the neighbouring day. Same rule the agenda
 * uses; see src/utilities/parisDay.ts for how the stored instant becomes this
 * string in the first place.
 */
const formatDay = (day: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', ...options }).format(
    new Date(`${day}T12:00:00Z`),
  )

const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

/**
 * When the entry happens, as the club would write it: « Mardi 15 septembre 2026 »
 * for a single day, « Du 4 au 11 octobre 2026 » for a séjour, and the month
 * repeated on both sides when the stay crosses one — « Du 30 janvier au 6 février
 * 2027 ».
 */
export const formatSchedule = (startDate: string, endDate?: string) => {
  if (!endDate || endDate === startDate) {
    return capitalise(
      formatDay(startDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    )
  }

  const sameMonth = startDate.slice(0, 7) === endDate.slice(0, 7)
  const start = formatDay(
    startDate,
    sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'long' },
  )
  const end = formatDay(endDate, { day: 'numeric', month: 'long', year: 'numeric' })

  return `Du ${start} au ${end}`
}

/** The day and month for the card's leading column: « 15 » over « sept. ». */
export const formatBadge = (day: string) => ({
  day: formatDay(day, { day: 'numeric' }),
  month: formatDay(day, { month: 'short' }).replace(/\.$/, ''),
})
