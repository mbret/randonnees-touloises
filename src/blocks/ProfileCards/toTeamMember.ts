import type { TeamMember } from '@/components/TeamSection/TeamSection'
import type { Adherent } from '@/payload-types'

/** What the block needs off an adhérent, and no more than that. */
export type PublishableAdherent = Pick<
  Adherent,
  'boardRole' | 'firstName' | 'lastName' | 'phone' | 'photo' | 'publicationConsent'
>

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
    contactLinks: phone ? [{ id: 'phone', type: 'phone', value: phone }] : undefined,
    media,
    name: [adherent.firstName, adherent.lastName].filter(Boolean).join(' '),
    role: adherent.boardRole ?? undefined,
  }
}
