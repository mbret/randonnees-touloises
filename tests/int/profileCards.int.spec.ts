import { describe, expect, it } from 'vitest'

import {
  toTeamMember,
  type PublishableAdherent,
} from '@/blocks/ProfileCards/toTeamMember'

const media = { alt: 'Portrait', id: 7, url: '/media/conseil-pascal-bret.png' }

const adherent = (overrides: Partial<PublishableAdherent> = {}): PublishableAdherent =>
  ({
    boardRole: 'Président',
    firstName: 'Pascal',
    lastName: 'BRET',
    phone: '0612345678',
    photo: media,
    publicationConsent: { email: false, phone: false, photo: false },
    ...overrides,
  }) as PublishableAdherent

describe('an adhérent as a profile card', () => {
  it('is written the way the club prints it, not the way the admin sorts it', () => {
    expect(toTeamMember(adherent()).name).toBe('Pascal BRET')
  })

  it('takes its function from the adhérent’s own record', () => {
    expect(toTeamMember(adherent()).role).toBe('Président')
    expect(toTeamMember(adherent({ boardRole: null })).role).toBeUndefined()
  })
})

describe('the two consents', () => {
  /**
   * The point of the split. A member of the conseil who has not agreed to a
   * photograph still appears — their function is the club's public record — and
   * `TeamSection` draws initials where there is no media.
   */
  it('shows the person but not the portrait without photo consent', () => {
    const card = toTeamMember(adherent())

    expect(card.name).toBe('Pascal BRET')
    expect(card.role).toBe('Président')
    expect(card.media).toBeUndefined()
  })

  it('shows the portrait once it is agreed to', () => {
    const card = toTeamMember(
      adherent({ publicationConsent: { email: false, phone: false, photo: true } }),
    )

    expect(card.media).toEqual(media)
  })

  it('publishes the telephone only on its own permission', () => {
    expect(toTeamMember(adherent()).contactLinks).toBeUndefined()

    const card = toTeamMember(
      adherent({ publicationConsent: { email: false, phone: true, photo: false } }),
    )

    expect(card.contactLinks).toEqual([{ id: 'phone', type: 'phone', value: '0612345678' }])
  })

  /** Neither permission implies the other. */
  it('keeps the two permissions independent', () => {
    const photoOnly = toTeamMember(
      adherent({ publicationConsent: { email: false, phone: false, photo: true } }),
    )
    const phoneOnly = toTeamMember(
      adherent({ publicationConsent: { email: false, phone: true, photo: false } }),
    )

    expect(photoOnly.media).toBeDefined()
    expect(photoOnly.contactLinks).toBeUndefined()
    expect(phoneOnly.media).toBeUndefined()
    expect(phoneOnly.contactLinks).toBeDefined()
  })

  it('publishes nothing when the record carries no permissions at all', () => {
    const card = toTeamMember(adherent({ publicationConsent: undefined }))

    expect(card.media).toBeUndefined()
    expect(card.contactLinks).toBeUndefined()
    expect(card.name).toBe('Pascal BRET')
  })

  /** Consent given but no number, or no portrait uploaded: nothing to publish. */
  it('needs something to publish as well as permission to', () => {
    const consent = { email: false, phone: true, photo: true }

    const card = toTeamMember(adherent({ phone: null, photo: null, publicationConsent: consent }))

    expect(card.media).toBeUndefined()
    expect(card.contactLinks).toBeUndefined()
  })

  /**
   * An unpopulated relationship arrives as an id. Rendering that would put a
   * number where the portrait goes, so it counts as nothing to publish.
   */
  it('ignores a portrait that came back as an id rather than a document', () => {
    const card = toTeamMember(
      adherent({ photo: 7, publicationConsent: { email: false, phone: false, photo: true } }),
    )

    expect(card.media).toBeUndefined()
  })
})
