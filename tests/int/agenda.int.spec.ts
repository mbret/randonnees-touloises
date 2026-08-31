import { beforeEach, describe, expect, it, vi } from 'vitest'

const find = vi.fn()

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: async () => ({ find }) }))

const { getAgendaEvents } = await import('@/components/agenda/getAgendaEvents')

type Doc = Record<string, unknown>

/** Answers the events query with one set of rows and the category query with the other. */
const database = (events: Doc[], categories: Doc[] = []) => {
  find.mockImplementation(async ({ collection }: { collection: string }) => ({
    docs: collection === 'events' ? events : categories,
  }))
}

const event = (overrides: Doc = {}): Doc => ({
  date: '2026-09-10T00:00:00.000Z',
  startTime: '09:00',
  title: null,
  ...overrides,
})

beforeEach(() => {
  find.mockReset()
})

describe('what names an outing on the agenda', () => {
  /*
   * The reason the title could be made optional at all: « Petite » beside a
   * category reading « Petite » is the same word typed twice. Read the category
   * and the card has its name; don't, and an ordinary walk shows a time and
   * nothing else.
   */
  it('falls back to the category when the event has no title of its own', async () => {
    database([event({ outingCategory: 3 })], [{ id: 3, title: 'Grande' }])

    expect(await getAgendaEvents()).toMatchObject([{ title: 'Grande' }])
  })

  /*
   * The card draws the tile, so the query has to reach through the category to
   * the media record behind it — `depth: 0` would hand back a bare id, which is
   * nothing anyone can render.
   */
  it('carries the category logo through to the card', async () => {
    const logo = { id: 9, filename: 'logo-grand-outing.png', url: '/api/media/file/x.png' }

    database([event({ outingCategory: 3 })], [{ id: 3, title: 'Grande', logo }])

    expect(await getAgendaEvents()).toMatchObject([{ logo, title: 'Grande' }])
    expect(find).toHaveBeenLastCalledWith(
      expect.objectContaining({ collection: 'outingCategories', depth: 1 }),
    )
  })

  /** A category nobody has given a logo yet still names its outings. */
  it('leaves the logo out when the category has none', async () => {
    database([event({ outingCategory: 3 })], [{ id: 3, title: 'Douce', logo: null }])

    const [agendaEvent] = await getAgendaEvents()

    expect(agendaEvent.title).toBe('Douce')
    expect(agendaEvent.logo).toBeUndefined()
  })

  /** The title is what the category cannot say, so it wins where there is one. */
  it('keeps the title when the event carries one', async () => {
    database(
      [event({ outingCategory: 3, title: 'Journée interclubs santé' })],
      [{ id: 3, title: 'Santé' }],
    )

    expect(await getAgendaEvents()).toMatchObject([{ title: 'Journée interclubs santé' }])
  })

  it('leaves an event with neither nameless rather than inventing one', async () => {
    database([event({ outingCategory: null })])

    expect(await getAgendaEvents()).toMatchObject([{ title: undefined }])
  })

  it('asks for the categories once, however many events share them', async () => {
    database(
      [
        event({ outingCategory: 3 }),
        event({ outingCategory: 3, date: '2026-09-11T00:00:00.000Z' }),
        event({ outingCategory: 4, date: '2026-09-12T00:00:00.000Z' }),
      ],
      [
        { id: 3, title: 'Grande' },
        { id: 4, title: 'Nordique' },
      ],
    )

    const events = await getAgendaEvents()

    expect(events.map(({ title }) => title)).toEqual(['Grande', 'Grande', 'Nordique'])
    expect(find).toHaveBeenCalledTimes(2)
    expect(find).toHaveBeenLastCalledWith(
      expect.objectContaining({
        collection: 'outingCategories',
        where: { id: { in: [3, 4] } },
      }),
    )
  })

  /** Nothing to look up is a query not worth making. */
  it('skips the category query when no event has one', async () => {
    database([event({ title: 'Assemblée générale' })])

    expect(await getAgendaEvents()).toMatchObject([{ title: 'Assemblée générale' }])
    expect(find).toHaveBeenCalledTimes(1)
  })
})

describe('the category’s figures on the card', () => {
  /*
   * The category's « en deux mots » — '11 à 15 km' — follows its name onto the
   * card, and only its name: an event that titles itself is the very walk
   * those figures may not describe, so it keeps its title unadorned.
   */
  it('passes the summary through when the category names the outing', async () => {
    database([event({ outingCategory: 3 })], [{ id: 3, title: 'Grande', summary: '11 à 15 km' }])

    expect(await getAgendaEvents()).toMatchObject([{ title: 'Grande', summary: '11 à 15 km' }])
  })

  /** The same reading `outingName` gives a cleared intitulé: '' is no title. */
  it('treats a cleared intitulé as no intitulé at all', async () => {
    database([event({ outingCategory: 3, title: '' })], [{ id: 3, title: 'Grande', summary: '11 à 15 km' }])

    expect(await getAgendaEvents()).toMatchObject([{ title: 'Grande', summary: '11 à 15 km' }])
  })

  it('withholds the figures from an event that titles itself', async () => {
    database(
      [event({ outingCategory: 3, title: 'Journée interclubs santé' })],
      [{ id: 3, title: 'Santé', summary: '5 à 6 km' }],
    )

    const [agendaEvent] = await getAgendaEvents()

    expect(agendaEvent.title).toBe('Journée interclubs santé')
    expect(agendaEvent.summary).toBeUndefined()
  })
})
