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
const count = vi.fn(async (_args: object) => ({ totalDocs: 1 }))

/** The pages the database would say carry a trombinoscope or profile cards. */
const find = vi.fn(async (_args: object) => ({
  docs: [{ slug: 'trombinoscope' }, { slug: 'board' }],
}))

/** How many outing categories draw the upload on the agenda: none, unless a test says. */
const countTiles = vi.fn(async () => ({ totalDocs: 0 }))

/** The published posts showing the upload: none, unless a test says. */
const findPosts = vi.fn(async (_args: object) => ({ docs: [] as Doc[] }))

/** The home page's settings: no hero, unless a test sets one. */
const findGlobal = vi.fn(async () => ({ homeHeroImage: null as null | number }))

const logError = vi.fn()

/* One request per operation, as Payload runs them: the delete's two hooks share
 * it, which is how the first leaves word for the second. */
const request = (context: object = {}) => ({
  context: { ...context },
  payload: {
    count: (args: { collection: string }) =>
      args.collection === 'outingCategories' ? countTiles() : count(args),
    find: (args: { collection: string }) =>
      args.collection === 'posts' ? findPosts(args) : find(args),
    findGlobal,
    logger: { error: logError, info: () => {} },
  },
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

const hero = (overrides: Doc = {}): Doc => ({
  filename: 'optimized-image (1).webp',
  id: 1230,
  ...overrides,
})

beforeEach(() => {
  revalidatePath.mockClear()
  revalidateTag.mockClear()
  count.mockClear()
  count.mockResolvedValue({ totalDocs: 1 })
  find.mockClear()
  countTiles.mockClear()
  countTiles.mockResolvedValue({ totalDocs: 0 })
  findPosts.mockClear()
  findPosts.mockResolvedValue({ docs: [] })
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
    expect(revalidatePath).toHaveBeenCalledWith('/animation-team')
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

describe('the home page’s hero deleted from the media library', () => {
  beforeEach(() => {
    count.mockResolvedValue({ totalDocs: 0 })
    findGlobal.mockResolvedValue({ homeHeroImage: 1230 })
  })

  /**
   * The database clears `homeHeroImage` without running the settings' hook, so
   * the cached copy would go on naming the deleted files until someone saved
   * the settings by hand.
   */
  it('expires the settings the home page reads it through', async () => {
    await remove(hero())

    expect(revalidateTag).toHaveBeenCalledWith('global_general', { expire: 0 })
  })

  /** Asked before the row goes, while the settings still name it. */
  it('asks before the delete rather than after', async () => {
    const req = request()

    /* eslint-disable @typescript-eslint/no-explicit-any */
    await (notePortraitDelete as any)({ collection: {}, id: 1230, req } as any)
    findGlobal.mockResolvedValue({ homeHeroImage: null })
    await (revalidateMediaDelete as any)({ collection: {}, doc: hero(), id: 1230, req } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    expect(findGlobal).toHaveBeenCalledTimes(1)
    expect(revalidateTag).toHaveBeenCalledWith('global_general', { expire: 0 })
  })

  it('leaves the settings alone when another picture is deleted', async () => {
    await remove(portrait())

    expect(revalidateTag).not.toHaveBeenCalledWith('global_general', expect.anything())
  })

  /* The REST API parses the id out of its URL; the local API passes on
   * whatever its caller gave it. */
  it('knows the hero by an id given as a string', async () => {
    await remove(hero({ id: '1230' }))

    expect(revalidateTag).toHaveBeenCalledWith('global_general', { expire: 0 })
  })

  /** Several uploads deleted at once share one request. */
  it('keeps each upload’s answer to itself when several go together', async () => {
    const req = request()

    /* eslint-disable @typescript-eslint/no-explicit-any */
    await (notePortraitDelete as any)({ collection: {}, id: 1230, req } as any)
    await (notePortraitDelete as any)({ collection: {}, id: 7, req } as any)
    await (revalidateMediaDelete as any)({ collection: {}, doc: portrait(), id: 7, req } as any)
    expect(revalidateTag).not.toHaveBeenCalledWith('global_general', expect.anything())

    await (revalidateMediaDelete as any)({ collection: {}, doc: hero(), id: 1230, req } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    expect(revalidateTag).toHaveBeenCalledWith('global_general', { expire: 0 })
  })

  it('declines when the caller asked for no revalidation', async () => {
    await remove(hero(), { disableRevalidate: true })

    expect(findGlobal).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  /* A lookup that fails is logged rather than allowed to stop a delete the
   * club asked for. */
  it('keeps the delete when the settings cannot be read', async () => {
    findGlobal.mockRejectedValue(new Error('connection reset'))

    await expect(remove(hero())).resolves.toBeUndefined()
    expect(logError).toHaveBeenCalledTimes(1)
    expect(revalidateTag).not.toHaveBeenCalledWith('global_general', expect.anything())
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

describe('an outing category’s tile replaced in the media library', () => {
  beforeEach(() => {
    count.mockResolvedValue({ totalDocs: 0 })
    countTiles.mockResolvedValue({ totalDocs: 1 })
  })

  /*
   * The agenda reads the category at depth 1, so the home page holds a copy of
   * the upload, and the hourly timer that used to replace that copy is gone.
   */
  it('refreshes the home page’s agenda', async () => {
    await change(
      { filename: 'logo-grande-2026.png', id: 9 },
      { filename: 'logo-grande.png', id: 9 },
    )

    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  /* The database clears the category's `logo` without running its hook. */
  it('refreshes it when the tile is deleted, having asked before', async () => {
    const req = request()

    /* eslint-disable @typescript-eslint/no-explicit-any */
    await (notePortraitDelete as any)({ collection: {}, id: 9, req } as any)
    countTiles.mockResolvedValue({ totalDocs: 0 })
    await (revalidateMediaDelete as any)({ collection: {}, doc: { id: 9 }, id: 9, req } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  it('leaves the home page alone for an upload no category draws', async () => {
    countTiles.mockResolvedValue({ totalDocs: 0 })

    await change(portrait({ filename: 'affiche-2026.jpg' }), portrait())

    expect(revalidatePath).not.toHaveBeenCalledWith('/')
  })
})

describe('a post’s picture replaced in the media library', () => {
  beforeEach(() => {
    count.mockResolvedValue({ totalDocs: 0 })
  })

  const posts = (...docs: Doc[]) => findPosts.mockResolvedValueOnce({ docs })

  it('refreshes the news post, and the listing whose cards show it', async () => {
    posts({ id: 4, schedule: {}, slug: 'assemblee-generale' })

    await change({ filename: 'ag-2026.jpg', id: 30 }, { filename: 'ag.jpg', id: 30 })

    expect(findPosts).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          and: [
            { _status: { equals: 'published' } },
            { or: [{ heroImage: { equals: 30 } }, { 'meta.image': { equals: 30 } }] },
          ],
        },
      }),
    )
    expect(revalidatePath).toHaveBeenCalledWith('/news/assemblee-generale')
    expect(revalidatePath).toHaveBeenCalledWith('/news')
    expect(revalidatePath).toHaveBeenCalledWith('/(frontend)/news/page/[pageNumber]', 'page')
  })

  /* The programme listings print no picture, so only the entry's own page. */
  it('refreshes a programme entry’s own page alone', async () => {
    posts({ id: 5, schedule: { startDate: '2026-11-08T23:00:00.000Z' }, slug: 'sortie-a-foug' })

    await change({ filename: 'foug-2026.jpg', id: 31 }, { filename: 'foug.jpg', id: 31 })

    expect(revalidatePath.mock.calls).toEqual([['/programs/sortie-a-foug']])
  })

  /* Their related-post cards draw it too. */
  it('refreshes the posts that list it as related', async () => {
    posts({ id: 4, schedule: {}, slug: 'assemblee-generale' })
    posts({ id: 6, schedule: {}, slug: 'compte-rendu' })

    await change({ filename: 'ag-2026.jpg', id: 30 }, { filename: 'ag.jpg', id: 30 })

    expect(findPosts).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { and: [{ _status: { equals: 'published' } }, { relatedPosts: { in: [4] } }] },
      }),
    )
    expect(revalidatePath).toHaveBeenCalledWith('/news/compte-rendu')
  })

  /* The database clears `heroImage` and `meta.image` without a post hook. */
  it('refreshes the post when the picture is deleted, having asked before', async () => {
    const req = request()

    posts({ id: 4, schedule: {}, slug: 'assemblee-generale' })

    /* eslint-disable @typescript-eslint/no-explicit-any */
    await (notePortraitDelete as any)({ collection: {}, id: 30, req } as any)
    await (revalidateMediaDelete as any)({ collection: {}, doc: { id: 30 }, id: 30, req } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    expect(revalidatePath).toHaveBeenCalledWith('/news/assemblee-generale')
  })

  it('refreshes nothing for an upload no post shows', async () => {
    await change({ filename: 'affiche.jpg', id: 32 }, { filename: 'affiche.jpg', id: 32 })

    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
