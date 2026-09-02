/**
 * How an adhérent is named wherever the admin names one.
 *
 * Surname first, the way the club's own sheet writes it — « BRET Pascal ». That
 * is not the order the site shows a person in (« Pascal BRET », on the conseil
 * and animation pages), and deliberately so: this string exists to be sorted,
 * searched and picked from a list of several hundred, where the surname is what
 * the secretary is looking for. The pages compose their own label from the two
 * fields.
 *
 * It is also the shape the sheet's own `Rattaché(e)` column uses to point one
 * adhérent at another, so a household typed as « ANDERLINI Isabelle » can be
 * matched against this without reordering anything.
 */
export const adherentName = ({
  firstName,
  lastName,
}: {
  firstName?: null | string
  lastName?: null | string
}): string => {
  const family = lastName?.trim() ?? ''
  const given = firstName?.trim()

  if (!family) return given ?? ''

  return given ? `${family} ${given}` : family
}
