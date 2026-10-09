import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidatePath = vi.fn()
const revalidateTag = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
}))

const { notePortraitDelete, revalidateMedia, revalidateMediaDelete } =
  await import('@/hooks/revalidateMedia')

type Doc = { [k: string]: unknown }

/** How many adhérents show the upload as their portrait, with permission. */
const count = vi.fn(async () => ({ totalDocs: 1 }))

/** The pages the database would say carry a trombinoscope or profile cards. */
const find = vi.fn(async () => ({ docs: [{ slug: 'trombinoscope' }, { slug: 'board' }] }))

/** The home page's settings: no hero, unless a test sets one. */
const findGlobal = vi.fn(async () => ({ homeHeroImage: null as null | number }))

const logError = vi.fn()

/* One request per operation, as Payload runs them: the delete's two hooks share
 * it, which is how the first leaves word for the second. */
const request = (context: object = {}) => ({
  context: { ...context },
  payload: { count, find, findGlobal, logger: { error: logError, info: () => {} } },
})

/* The hooks want full Payload arguments; these tests give them the fields they
 * actually read. */
/* eslint-disable @typescript-eslint/no-explicit-any */
const change = (
  doc: Doc,
  previousDoc: Doc,
  { context = {}, operation = 'update' }: { context?: object; operation?: string } = {},
) =>
  (revalidateMedia as any)({
    collection: {},
    doc,
    operation,
    previousDoc,
    req: request(context),
  } as any)

const remove = async (doc: Doc, context: object = {}) => {
  const req = request(context)

  await (notePortraitDelete as any)({ collection: {}, id: doc.id, req } as any)
  await (revalidateMediaDelete as any)({ collection: {}, doc, id: doc.id, req } as any)
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const portrait = (overrides: Doc = {}): Doc => ({
  filename: 'trombinoscope-brigitte-5b1ead1292f66.jpg',
  id: 7,
  ...overrides,
})

beforeEach(() => {
  revalidatePath.mockClear()
  revalidateTag.mockClear()
  count.mockClear()
  count.mockResolvedValue({ totalDocs: 1 })
  find.mockClear()
  findGlobal.mockClear()
  findGlobal.mockResolvedValue({ homeHeroImage: null })
  logError.mockClear()
})

describe('a portrait replaced in the media library', () => {
  /** The case nothing caught: the fiche still points at the same document. */
  it('refreshes the pages that show it', async () => {
    await change(portrait({ filename: 'brigitte-2026.jpg' }), portrait())

    expect(revalidatePath).toHaveBeenCalledWith('/trombinoscope')
    expect(revalidatePath).toHaveBeenCalledWith('/board')
  })

  it('asks only about adhérents who let it be shown', async () => {
    await change(portrait(), portrait())

    expect(count).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'adherents',
        req: expect.anything(),
        where: {
          and: [{ photo: { equals: 7 } }, { 'publicationConsent.photo': { equals: true } }],
        },
      }),
    )
  })

  it('leaves the pages alone for an upload no page shows as a portrait', async () => {
    count.mockResolvedValueOnce({ totalDocs: 0 })

    await change(portrait({ filename: 'affiche-2026.jpg' }), portrait())

    expect(find).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  /** A new upload cannot be anybody's portrait yet. */
  it('does not ask at all when the upload is new', async () => {
    await change(portrait(), {}, { operation: 'create' })

    expect(count).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  /** What the size backfill sets, from a command with no Next to refresh. */
  it('declines when the caller asked for no revalidation', async () => {
    await change(portrait({ filename: 'brigitte-2026.jpg' }), portrait(), {
      context: { disableRevalidate: true },
    })

    expect(count).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('a portrait deleted from the media library', () => {
  /**
   * The database clears the fiche's `photo` without running a single adhérent
   * hook, so the media delete is the only place left to notice.
   */
  it('refreshes the pages that showed it', async () => {
    await remove(portrait())

    expect(revalidatePath).toHaveBeenCalledWith('/trombinoscope')
    expect(revalidatePath).toHaveBeenCalledWith('/board')
  })

  /** Asked before the row goes, while the reference still exists. */
  it('asks before the delete rather than after', async () => {
    const req = request()

    /* eslint-disable @typescript-eslint/no-explicit-any */
    await (notePortraitDelete as any)({ collection: {}, id: 7, req } as any)
    count.mockResolvedValue({ totalDocs: 0 })
    await (revalidateMediaDelete as any)({ collection: {}, doc: portrait(), id: 7, req } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    expect(count).toHaveBeenCalledTimes(1)
    expect(revalidatePath).toHaveBeenCalledWith('/trombinoscope')
  })

  it('leaves the pages alone for an upload no page showed as a portrait', async () => {
    count.mockResolvedValueOnce({ totalDocs: 0 })

    await remove(portrait({ filename: 'affiche-2026.jpg' }))

    expect(revalidatePath).not.toHaveBeenCalled()
  })

  /** Several uploads deleted at once share one request. */
  it('keeps each upload’s answer to itself when several go together', async () => {
    const req = request()

    /* eslint-disable @typescript-eslint/no-explicit-any */
    count.mockResolvedValueOnce({ totalDocs: 1 }).mockResolvedValueOnce({ totalDocs: 0 })
    await (notePortraitDelete as any)({ collection: {}, id: 7, req } as any)
    await (notePortraitDelete as any)({ collection: {}, id: 8, req } as any)
    await (revalidateMediaDelete as any)({ collection: {}, doc: { id: 8 }, id: 8, req } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('declines when the caller asked for no revalidation', async () => {
    await remove(portrait(), { disableRevalidate: true })

    expect(count).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('the home page’s hero replaced in the media library', () => {
  const hero = (overrides: Doc = {}): Doc => ({
    filename: 'optimized-image (1).webp',
    id: 1230,
    ...overrides,
  })

  beforeEach(() => {
    count.mockResolvedValue({ totalDocs: 0 })
    findGlobal.mockResolvedValue({ homeHeroImage: 1230 })
  })

  /**
   * The case that reached the live site. The settings still name the same
   * document, so their own hook never ran, and the cached copy of it went on
   * naming files the replacement had deleted.
   */
  it('expires the settings the home page reads it through', async () => {
    await change(hero({ filename: 'ezgif-54afd13ceb7dfbf9.webp' }), hero())

    expect(revalidateTag).toHaveBeenCalledWith('global_general', { expire: 0 })
  })

  /* Expiring the settings re-renders the home page and every gated post, which
   * is not a price to pay for a picture the hero does not show. */
  it('leaves the settings alone for any other picture', async () => {
    await change(portrait({ filename: 'brigitte-2026.jpg' }), portrait())

    expect(revalidateTag).not.toHaveBeenCalledWith('global_general', expect.anything())
  })

  it('leaves them alone while no hero is set', async () => {
    findGlobal.mockResolvedValue({ homeHeroImage: null })

    await change(hero(), hero())

    expect(revalidateTag).not.toHaveBeenCalledWith('global_general', expect.anything())
  })

  /** A new upload cannot be the hero yet. */
  it('does not ask at all when the upload is new', async () => {
    await change(hero(), {}, { operation: 'create' })

    expect(findGlobal).not.toHaveBeenCalled()
  })

  it('declines when the caller asked for no revalidation', async () => {
    await change(hero({ filename: 'ezgif-54afd13ceb7dfbf9.webp' }), hero(), {
      context: { disableRevalidate: true },
    })

    expect(findGlobal).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  /* The upload has been saved by the time this runs; a lookup that fails is
   * logged rather than turned into an error on a save that worked. */
  it('keeps the save when the settings cannot be read', async () => {
    findGlobal.mockRejectedValue(new Error('connection reset'))
    const doc = hero({ filename: 'ezgif-54afd13ceb7dfbf9.webp' })

    await expect(change(doc, hero())).resolves.toBe(doc)
    expect(logError).toHaveBeenCalledTimes(1)
  })
})

describe('the site assets', () => {
  it('still expire when the logo is replaced', async () => {
    count.mockResolvedValue({ totalDocs: 0 })

    await change({ filename: 'logo.webp', id: 1 }, { filename: 'logo.webp', id: 1 })

    expect(revalidateTag).toHaveBeenCalledWith('medias', { expire: 0 })
  })

  it('still expire when the logo is deleted', async () => {
    count.mockResolvedValue({ totalDocs: 0 })

    await remove({ filename: 'logo.webp', id: 1 })

    expect(revalidateTag).toHaveBeenCalledWith('medias', { expire: 0 })
  })
})
