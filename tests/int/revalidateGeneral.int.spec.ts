import { describe, it, expect, vi, beforeEach } from 'vitest'

const revalidateTag = vi.fn()
const revalidatePath = vi.fn()

vi.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}))

const { revalidateGeneral } = await import('@/cms/globals/general/revalidateGeneral')

const run = (doc: unknown, previousDoc: unknown, disableRevalidate = false) =>
  // The hook only reads these few properties of the Payload request.
  (revalidateGeneral as unknown as (args: unknown) => unknown)({
    doc,
    previousDoc,
    req: { payload: { logger: { info: () => {} } }, context: { disableRevalidate } },
  })

const WITH = { contentPassword: 'gate-fixture-value' }
const WITHOUT = { contentPassword: '' }

beforeEach(() => {
  revalidateTag.mockClear()
  revalidatePath.mockClear()
})

describe('revalidateGeneral', () => {
  it('drops the cached read of the global on any change', () => {
    run(WITH, WITH)

    expect(revalidateTag).toHaveBeenCalledWith('global_general', { expire: 0 })
  })

  it('rebuilds the post pages when a password is set for the first time', () => {
    run(WITH, WITHOUT)

    expect(revalidatePath.mock.calls).toEqual([
      ['/news/[slug]', 'page'],
      ['/programs/[slug]', 'page'],
    ])
  })

  it('rebuilds the post pages when the password is cleared', () => {
    run(WITHOUT, WITH)

    expect(revalidatePath).toHaveBeenCalledTimes(2)
  })

  it('leaves the pages alone when one password replaces another', () => {
    // Already rendered per request, and they read the new value through the tag.
    run({ contentPassword: 'another-fixture' }, WITH)

    expect(revalidatePath).not.toHaveBeenCalled()
    expect(revalidateTag).toHaveBeenCalled()
  })

  it('does nothing at all when revalidation is disabled', () => {
    run(WITH, WITHOUT, true)

    expect(revalidateTag).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
