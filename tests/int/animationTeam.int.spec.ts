import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Media } from '@/payload-types'

const find = vi.fn()

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ find }) }))

const { getAnimationTeam } = await import('@/app/(frontend)/animation-team/getAnimationTeam')

type Doc = Record<string, unknown>

const media = (id: number): Media => ({
  alt: null,
  createdAt: '2026-10-13T16:01:45.054Z',
  filename: `portrait-${id}.jpg`,
  height: 327,
  id,
  mimeType: 'image/jpeg',
  updatedAt: '2026-10-13T16:01:45.054Z',
  url: `/api/media/file/portrait-${id}.jpg`,
  width: 300,
})

let nextId = 1

/** A fiche as the query hands it back: the fields it selects, and its id. */
const fiche = (firstName: string, lastName: string, overrides: Doc = {}): Doc => {
  const id = nextId++

  return {
    firstName,
    id,
    lastName,
    phone: '0610538781',
    photo: media(100 + id),
    publicationConsent: { email: false, phone: true, photo: true },
    ...overrides,
  }
}

const database = (fiches: Doc[]) => find.mockResolvedValue({ docs: fiches })

beforeEach(() => {
  find.mockReset()
})

describe('who is on the animation team', () => {
  /**
   * The list is the box on each fiche, read past the access check since
   * `adherents` is closed to public reads — so the fields are named, and the
   * conseil's function is not among them.
   */
  it('asks for everyone ticked as an animateur, and only what a card shows', async () => {
    database([])

    await getAnimationTeam()

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'adherents',
        overrideAccess: true,
        select: {
          firstName: true,
          lastName: true,
          phone: true,
          photo: true,
          publicationConsent: true,
        },
        where: { isAnimateur: { equals: true } },
      }),
    )
  })

  it('names each card the way the fiche writes it', async () => {
    database([fiche('Pierre', 'LAURENT')])

    const [card] = await getAnimationTeam()

    expect(card?.name).toBe('Pierre LAURENT')
    expect(card?.role).toBeUndefined()
  })

  /** « ÉTIENNE » among the E, not after the Z where a byte order puts it. */
  it('orders them by surname, then first name, the way French reads', async () => {
    database([
      fiche('Suzanne', 'ROCHEFOLLE'),
      fiche('Roland', 'FERRARI'),
      fiche('Paul', 'ÉTIENNE'),
      fiche('Daniel', 'ROCHEFOLLE'),
      fiche('Isabelle', 'ANDERLINI'),
    ])

    const cards = await getAnimationTeam()

    expect(cards.map((card) => card.name)).toEqual([
      'Isabelle ANDERLINI',
      'Paul ÉTIENNE',
      'Roland FERRARI',
      'Daniel ROCHEFOLLE',
      'Suzanne ROCHEFOLLE',
    ])
  })
})

describe('what each card shows', () => {
  /**
   * What the club ran into: the page drew the photograph copied off the old
   * website, while the fiche had been given a newer one.
   */
  it('takes the portrait from the fiche', async () => {
    const pierre = fiche('Pierre', 'LAURENT')

    database([pierre])

    const [card] = await getAnimationTeam()

    expect(card?.media).toEqual(pierre.photo)
  })

  it('shows the portrait only with « Portrait » ticked', async () => {
    database([fiche('Pierre', 'LAURENT', { publicationConsent: { phone: true, photo: false } })])

    const [card] = await getAnimationTeam()

    expect(card?.media).toBeUndefined()
    expect(card?.name).toBe('Pierre LAURENT')
  })

  it('shows the telephone only with « Téléphone » ticked', async () => {
    database([
      fiche('Pierre', 'LAURENT'),
      fiche('Bernard', 'TUAILLON', { publicationConsent: { phone: false, photo: true } }),
    ])

    const [laurent, tuaillon] = await getAnimationTeam()

    expect(laurent?.contactLinks).toEqual([{ id: 'phone', type: 'phone', value: '06 10 53 87 81' }])
    expect(tuaillon?.contactLinks).toBeUndefined()
    expect(tuaillon?.media).toBeDefined()
  })
})
