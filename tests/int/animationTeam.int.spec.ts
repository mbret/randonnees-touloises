import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { StaticTeamMember } from '@/data/teams'
import type { Media } from '@/payload-types'

const find = vi.fn()

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ find }) }))

const { resolveTeamPhotos } = await import('@/utilities/resolveTeamPhotos')

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

/** A fiche as the query hands it back: the four fields it selects, and its id. */
const fiche = (firstName: string, lastName: string, overrides: Doc = {}): Doc => {
  const id = nextId++

  return {
    firstName,
    id,
    lastName,
    photo: media(100 + id),
    publicationConsent: { email: false, phone: false, photo: true },
    ...overrides,
  }
}

const database = (fiches: Doc[]) => find.mockResolvedValue({ docs: fiches })

const member = (name: string, overrides: Partial<StaticTeamMember> = {}): StaticTeamMember => ({
  contactLinks: [{ id: 'phone', type: 'phone', value: '06 10 53 87 81' }],
  name,
  ...overrides,
})

beforeEach(() => {
  find.mockReset()
})

describe('the portraits on the animation team', () => {
  /**
   * What the club ran into: the page drew the photograph copied off the old
   * website, while the fiche had been given a newer one.
   */
  it('takes each portrait from the person’s fiche', async () => {
    const pierre = fiche('Pierre', 'LAURENT')

    database([fiche('Paulette', 'LAURENT'), pierre])

    const [card] = await resolveTeamPhotos([member('Pierre LAURENT')])

    expect(card?.media).toEqual(pierre.photo)
  })

  /** How the list in code and the fiches actually differ today. */
  it('finds the fiche however either side typed the name', async () => {
    const fiches = [
      fiche('Gerald', 'SABOT'),
      fiche('Jean-Luc', 'STEPHAN'),
      fiche('Roger', 'FRANCOIS'),
    ]

    database(fiches)

    const cards = await resolveTeamPhotos([
      member('Gérald SABOT'),
      member('Jean-luc STEPHAN'),
      member('Roger FRANÇOIS'),
    ])

    expect(cards.map((card) => card.media)).toEqual(fiches.map((doc) => doc.photo))
  })

  it('follows a member to a fiche kept under another name', async () => {
    const daniel = fiche('Daniel', 'ROCHEFOLLE')

    database([daniel])

    const [card] = await resolveTeamPhotos([
      member('Dany ROCHEFOLLE', { ficheName: 'Daniel ROCHEFOLLE' }),
    ])

    expect(card?.media).toEqual(daniel.photo)
    expect(card?.name).toBe('Dany ROCHEFOLLE')
    expect(card).not.toHaveProperty('ficheName')
  })

  /** The rest of the card is the list's, in the list's order. */
  it('keeps the name, the number and the order the list gives', async () => {
    database([fiche('Bernard', 'TUAILLON'), fiche('Bernard', 'ATTENOT')])

    const cards = await resolveTeamPhotos([member('Bernard ATTENOT'), member('Bernard TUAILLON')])

    expect(cards.map(({ contactLinks, name }) => ({ contactLinks, name }))).toEqual([
      { contactLinks: member('').contactLinks, name: 'Bernard ATTENOT' },
      { contactLinks: member('').contactLinks, name: 'Bernard TUAILLON' },
    ])
  })
})

describe('when there is no portrait to show', () => {
  /** A portrait on file is not consent, whatever the query let through. */
  it('draws initials when « Portrait » is not ticked on the fiche', async () => {
    database([fiche('Pierre', 'LAURENT', { publicationConsent: { photo: false } })])

    const [card] = await resolveTeamPhotos([member('Pierre LAURENT')])

    expect(card?.media).toBeUndefined()
  })

  it('draws initials when no fiche carries the name', async () => {
    database([fiche('Pierre', 'REVEST')])

    const [card] = await resolveTeamPhotos([member('Pierre LAURENT')])

    expect(card?.media).toBeUndefined()
  })

  /** Two fiches answering to one name leave no saying whose face it is. */
  it('draws initials when two fiches carry the name', async () => {
    database([fiche('Pierre', 'LAURENT'), fiche('Pierre', 'LAURENT')])

    const [card] = await resolveTeamPhotos([member('Pierre LAURENT')])

    expect(card?.media).toBeUndefined()
  })

  /**
   * An unpopulated relationship arrives as an id. Rendering that would put a
   * number where the portrait goes, so it counts as no portrait.
   */
  it('ignores a portrait that came back as an id rather than a document', async () => {
    database([fiche('Pierre', 'LAURENT', { photo: 7 })])

    const [card] = await resolveTeamPhotos([member('Pierre LAURENT')])

    expect(card?.media).toBeUndefined()
  })
})

describe('what it reads', () => {
  /**
   * Past the access check, since `adherents` is closed to public reads — so
   * the fields are named, and the fiches with nothing to show are left in the
   * database.
   */
  it('asks only for fiches with a portrait to show, and only the fields it needs', async () => {
    database([])

    await resolveTeamPhotos([member('Pierre LAURENT')])

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'adherents',
        overrideAccess: true,
        select: { firstName: true, lastName: true, photo: true, publicationConsent: true },
        where: {
          and: [{ 'publicationConsent.photo': { equals: true } }, { photo: { exists: true } }],
        },
      }),
    )
  })
})
