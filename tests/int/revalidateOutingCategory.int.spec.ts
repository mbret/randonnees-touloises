import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidatePath = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  revalidateTag: vi.fn(),
}))

const { revalidateOutingCategory, revalidateOutingCategoryDelete } = await import(
  '@/collections/OutingCategories/hooks/revalidateOutingCategory'
)

const req = { payload: { logger: { info: () => {} } }, context: {} }

/* The hooks want a full Payload request; these tests give them the two fields
 * they actually read. */
/* eslint-disable @typescript-eslint/no-explicit-any */
const change = (context: object = {}) =>
  (revalidateOutingCategory as any)({
    collection: {},
    doc: { id: 1, title: 'Grande' },
    operation: 'update',
    req: { ...req, context },
  } as any)

const remove = (context: object = {}) =>
  (revalidateOutingCategoryDelete as any)({
    collection: {},
    doc: { id: 1, title: 'Grande' },
    req: { ...req, context },
  } as any)
/* eslint-enable @typescript-eslint/no-explicit-any */

beforeEach(() => {
  revalidatePath.mockClear()
})

describe('revalidateOutingCategory', () => {
  /*
   * The agenda prints the category's name and its pictogram, and the home page
   * is cached for an hour. Attaching a logo by hand — the one step of the
   * backfill that cannot be scripted — has to reach the page before then.
   */
  it('refreshes the agenda when a category changes', () => {
    change()

    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  it('refreshes the agenda when one is deleted', () => {
    remove()

    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  /* What lets the importer run outside a Next request, where the call throws. */
  it('stands down when the write asks it to', () => {
    change({ disableRevalidate: true })
    remove({ disableRevalidate: true })

    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
