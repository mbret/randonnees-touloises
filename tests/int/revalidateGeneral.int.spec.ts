import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidateTag = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
}))

const { revalidateGeneral } = await import('@/cms/globals/general/revalidateGeneral')

/* The hook wants a full Payload request; this gives it the two fields it
 * actually reads. */
/* eslint-disable @typescript-eslint/no-explicit-any */
const change = (context: object = {}) =>
  (revalidateGeneral as any)({
    doc: { homeHeroImage: 7 },
    global: {},
    req: { payload: { logger: { info: () => {} } }, context },
  } as any)
/* eslint-enable @typescript-eslint/no-explicit-any */

beforeEach(() => {
  revalidateTag.mockClear()
})

describe('revalidateGeneral', () => {
  /*
   * The home page is cached for an hour and reads its hero photograph through
   * `getCachedGlobal`, so without this the club uploads a picture and waits.
   * The tag reaches the rendered page as well as the cached read.
   */
  it('expires the cached global when the settings change', () => {
    change()

    expect(revalidateTag).toHaveBeenCalledWith('global_general', { expire: 0 })
  })

  /* What lets the import scripts write outside a Next request, where the call
   * throws. */
  it('stands down when the write asks it to', () => {
    change({ disableRevalidate: true })

    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('hands the document back either way', () => {
    expect(change()).toEqual({ homeHeroImage: 7 })
    expect(change({ disableRevalidate: true })).toEqual({ homeHeroImage: 7 })
  })
})
