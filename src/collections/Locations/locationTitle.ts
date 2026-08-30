/**
 * How a start location is named, everywhere one is named.
 *
 * The club's own format, from the agenda it printed for years: the commune,
 * then the spot within it in brackets — « Boucq (terrain de foot) ». Derived
 * rather than typed, so the two halves cannot drift apart from the label built
 * out of them, and so a rename of the commune carries.
 */
export const locationTitle = ({
  commune,
  spot,
}: {
  commune?: null | string
  spot?: null | string
}): string => {
  const place = commune?.trim() ?? ''
  const detail = spot?.trim()

  if (!place) return detail ?? ''

  return detail ? `${place} (${detail})` : place
}
