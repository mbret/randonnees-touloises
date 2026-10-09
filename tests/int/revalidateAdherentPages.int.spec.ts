import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidatePath = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  revalidateTag: vi.fn(),
}))

const { revalidateAdherentPages, revalidateAdherentPagesDelete } =
  await import('@/collections/Adherents/hooks/revalidateAdherentPages')

type Doc = { [k: string]: unknown }

/** The pages the database would say carry a trombinoscope or profile cards. */
const find = vi.fn(async () => ({ docs: [{ slug: 'trombinoscope' }, { slug: 'board' }] }))

const request = (context: object = {}) => ({
  context,
  payload: { find, logger: { info: () => {} } },
})

/* The hooks want a full Payload request; these tests give them the fields they
 * actually read. */
/* eslint-disable @typescript-eslint/no-explicit-any */
const change = (
  doc: Doc,
  previousDoc: Doc | undefined,
  { context = {}, operation = 'update' }: { context?: object; operation?: string } = {},
) =>
  (revalidateAdherentPages as any)({
    collection: {},
    doc,
    operation,
    previousDoc: previousDoc ?? {},
    req: request(context),
  } as any)

const remove = (doc: Doc, context: object = {}) =>
  (revalidateAdherentPagesDelete as any)({ collection: {}, doc, req: request(context) } as any)
/* eslint-enable @typescript-eslint/no-explicit-any */

const fiche = (overrides: Doc = {}): Doc => ({
  address: '12 rue de la Gare',
  boardRole: null,
  firstName: 'Brigitte',
  id: 12,
  lastName: 'MARTIN',
  phone: '06 12 34 56 78',
  photo: 7,
  publicationConsent: { email: false, phone: false, photo: true },
  ...overrides,
})

beforeEach(() => {
  revalidatePath.mockClear()
  find.mockClear()
})

describe('a new adhérent', () => {
  it('refreshes the pages when they arrive ready for the trombinoscope', async () => {
    await change(fiche(), undefined, { operation: 'create' })

    expect(revalidatePath).toHaveBeenCalledWith('/trombinoscope')
    expect(revalidatePath).toHaveBeenCalledWith('/board')
  })

  /**
   * What the CSV import creates: a person with neither a portrait nor a
   * permission, whom no page can show yet.
   */
  it('refreshes nothing when no page can show them', async () => {
    await change(fiche({ photo: null, publicationConsent: { photo: false } }), undefined, {
      operation: 'create',
    })
    await change(fiche({ publicationConsent: { photo: false } }), undefined, {
      operation: 'create',
    })

    expect(find).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('an edited fiche', () => {
  it('refreshes the pages when « Portrait » is ticked', async () => {
    await change(fiche(), fiche({ publicationConsent: { photo: false } }))

    expect(revalidatePath).toHaveBeenCalledWith('/trombinoscope')
  })

  /** The change that must not wait for a deploy. */
  it('refreshes them when the permission is withdrawn', async () => {
    await change(fiche({ publicationConsent: { photo: false } }), fiche())

    expect(revalidatePath).toHaveBeenCalledWith('/trombinoscope')
  })

  it('refreshes them when the portrait is replaced or removed', async () => {
    await change(fiche({ photo: 8 }), fiche())
    await change(fiche({ photo: null }), fiche())

    expect(revalidatePath).toHaveBeenCalledTimes(4)
  })

  it('refreshes them when a name the cards print is corrected', async () => {
    await change(fiche({ firstName: 'Brigite' }), fiche())

    expect(revalidatePath).toHaveBeenCalledWith('/trombinoscope')
  })

  /** What the profile cards print beyond the trombinoscope. */
  it('refreshes them for the surname, the function and the telephone', async () => {
    await change(fiche({ lastName: 'MARTIN-DURAND' }), fiche())
    await change(fiche({ boardRole: 'Trésorière' }), fiche())
    await change(fiche({ phone: '07 00 00 00 00' }), fiche())
    await change(fiche({ publicationConsent: { phone: true, photo: true } }), fiche())

    expect(find).toHaveBeenCalledTimes(4)
  })

  it('leaves the pages alone for what no card draws', async () => {
    await change(fiche({ address: '3 place de la République', licence: '0947011C' }), fiche())

    expect(find).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  /** One side populated, the other an id: the same portrait either way. */
  it('reads a populated portrait and its id as the same portrait', async () => {
    await change(fiche({ photo: { id: 7, url: '/media/brigitte.jpg' } }), fiche({ photo: 7 }))

    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('declines when the caller asked for no revalidation', async () => {
    await change(fiche({ publicationConsent: { photo: false } }), fiche(), {
      context: { disableRevalidate: true },
    })

    expect(find).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('a deleted adhérent', () => {
  it('refreshes every page that could have shown them', async () => {
    await remove(fiche())

    expect(revalidatePath).toHaveBeenCalledWith('/trombinoscope')
    expect(revalidatePath).toHaveBeenCalledWith('/board')
  })

  it('declines when the caller asked for no revalidation', async () => {
    await remove(fiche(), { disableRevalidate: true })

    expect(revalidatePath).not.toHaveBeenCalled()
  })
})

describe('which pages', () => {
  /**
   * Found by the blocks they carry, as one equality per block: on Postgres an
   * `in` over both block types matches no page at all.
   */
  it('asks for the pages carrying either block, inside the write’s transaction', async () => {
    await remove(fiche())

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'pages',
        req: expect.anything(),
        where: {
          or: [
            { 'layout.blockType': { equals: 'profileCards' } },
            { 'layout.blockType': { equals: 'trombinoscope' } },
          ],
        },
      }),
    )
  })

  it('skips a page that has no slug to be revalidated at', async () => {
    find.mockResolvedValueOnce({ docs: [{ slug: '' }, { slug: 'board' }] })

    await remove(fiche())

    expect(revalidatePath).toHaveBeenCalledTimes(1)
    expect(revalidatePath).toHaveBeenCalledWith('/board')
  })
})
