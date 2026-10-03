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

/* One request per operation, as Payload runs them: the delete's two hooks share
 * it, which is how the first leaves word for the second. */
const request = (context: object = {}) => ({
  context: { ...context },
  payload: { count, find, logger: { info: () => {} } },
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
