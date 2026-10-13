import type { TeamMember } from '@/components/TeamSection/TeamSection'
import type { Adherent } from '@/payload-types'

/** What the block needs off an adhérent, and no more than that. */
export type PublishableAdherent = Pick<
  Adherent,
  'boardRole' | 'firstName' | 'lastName' | 'phone' | 'photo' | 'publicationConsent'
>

/**
 * A French number in pairs, « 06 15 10 59 93 », the way the club prints one:
 * the fiche stores it with nothing between the digits. Anything else, an
 * international number among them, is printed as stored. `TeamSection` takes
 * the spaces out again for the link.
 */
const readablePhone = (phone: string) =>
  /^0\d{9}$/.test(phone) ? phone.replace(/(\d{2})(?=\d)/g, '$1 ') : phone

/**
 * An adhérent as a card, with the two consents doing their work.
 *
 * Name and function are shown for anyone in the list. An association declares
 * its bureau publicly and its animateurs lead advertised walks, so who holds
 * which function is not the private part — the photograph and the telephone
 * number are, and each has its own permission. Neither is inferred from the
 * other: an animateur publishing a mobile number has said nothing about whether
 * their face belongs on the site.
 *
 * Without the photo permission the card falls back to initials, which
 * `TeamSection` already draws. That is deliberately not the same as leaving the
 * person out: hiding a member of the conseil from the page that lists the
 * conseil would make the club's own public record wrong.
 *
 * Written « Prénom NOM », the way the club prints it and the reverse of the
 * `fullName` the admin sorts by.
 */
export const toTeamMember = (adherent: PublishableAdherent): TeamMember => {
  const consent = adherent.publicationConsent

  const media =
    consent?.photo && adherent.photo && typeof adherent.photo === 'object'
      ? adherent.photo
      : undefined

  const phone = consent?.phone && adherent.phone ? adherent.phone : undefined

  return {
    contactLinks: phone ? [{ id: 'phone', type: 'phone', value: readablePhone(phone) }] : undefined,
    media,
    name: [adherent.firstName, adherent.lastName].filter(Boolean).join(' '),
    role: adherent.boardRole ?? undefined,
  }
}
