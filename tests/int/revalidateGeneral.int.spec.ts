import { describe, it, expect, vi, beforeEach } from 'vitest'

const revalidateTag = vi.fn()

vi.mock('next/cache', () => ({
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
}))

const { revalidateGeneral } = await import('@/cms/globals/general/revalidateGeneral')

const run = (disableRevalidate = false) =>
  // The hook reads only these few properties of the Payload request.
  (revalidateGeneral as unknown as (args: unknown) => unknown)({
    doc: { contentPassword: 'gate-fixture-value' },
    req: { payload: { logger: { info: () => {} } }, context: { disableRevalidate } },
  })

beforeEach(() => {
  revalidateTag.mockClear()
})

describe('revalidateGeneral', () => {
  it('expires the cached read of the global', () => {
    run()

    expect(revalidateTag).toHaveBeenCalledWith('global_general', { expire: 0 })
  })

  it('stays out of the way when revalidation is disabled', () => {
    run(true)

    expect(revalidateTag).not.toHaveBeenCalled()
  })
})
