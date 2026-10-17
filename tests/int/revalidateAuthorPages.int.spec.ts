import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidatePath = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  revalidateTag: vi.fn(),
}))

const { noteAuthorPagesBeforeDelete, revalidateAuthorPages, revalidateAuthorPagesDelete } =
  await import('@/collections/Users/hooks/revalidateAuthorPages')

type Doc = { [k: string]: unknown }

/** The published posts naming the user as author, then those relating to them. */
const find = vi.fn(async (_args: object) => ({ docs: [] as Doc[] }))

const request = (context: object = {}) => ({
  context: { ...context },
  payload: { find, logger: { info: () => {} } },
})

/* eslint-disable @typescript-eslint/no-explicit-any */
const change = (doc: Doc, previousDoc: Doc, context: object = {}) =>
  (revalidateAuthorPages as any)({
    collection: {},
    doc,
    operation: 'update',
    previousDoc,
    req: request(context),
  } as any)
/* eslint-enable @typescript-eslint/no-explicit-any */

const user = (overrides: Doc = {}): Doc => ({ id: 2, name: 'Brigitte Martin', ...overrides })

const byBrigitte = () =>
  find.mockResolvedValueOnce({ docs: [{ id: 4, schedule: {}, slug: 'assemblee-generale' }] })

beforeEach(() => {
  revalidatePath.mockClear()
  find.mockClear()
  find.mockResolvedValue({ docs: [] })
})

describe('an author renamed', () => {
  it('refreshes the pages that print the name', async () => {
    byBrigitte()

    await change(user({ name: 'Brigitte Martin-Henry' }), user())

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'posts',
        where: { and: [{ _status: { equals: 'published' } }, { authors: { equals: 2 } }] },
      }),
    )
    expect(revalidatePath).toHaveBeenCalledWith('/news/assemblee-generale')
    expect(revalidatePath).toHaveBeenCalledWith('/news')
  })

  /* Logging in writes to the user as well; nothing a page shows has moved. */
  it('leaves everything alone when the name has not changed', async () => {
    await change(user({ loginAttempts: 1 }), user())

    expect(find).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('declines when the caller asked for no revalidation', async () => {
    await change(user({ name: 'B. Martin' }), user(), { disableRevalidate: true })

    expect(find).not.toHaveBeenCalled()
  })
})

describe('an author deleted', () => {
  /* The database drops the author rows with the user, so ask first. */
  it('refreshes the pages that printed the name, having asked before', async () => {
    const req = request()

    byBrigitte()

    /* eslint-disable @typescript-eslint/no-explicit-any */
    await (noteAuthorPagesBeforeDelete as any)({ collection: {}, id: 2, req } as any)
    await (revalidateAuthorPagesDelete as any)({ collection: {}, doc: user(), id: 2, req } as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    expect(revalidatePath).toHaveBeenCalledWith('/news/assemblee-generale')
  })
})
