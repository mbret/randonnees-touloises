import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidateTag = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
}))

const { revalidateMedia } = await import('@/hooks/revalidateMedia')

/** The document the home page's settings name as their hero. */
const HERO = 1230

type Save = {
  context?: object
  /** What the `general` global answers, or the error it throws. */
  general?: Error | { homeHeroImage: null | number }
  id?: number
  operation?: 'create' | 'update'
}

/* The hook wants a full Payload request; this gives it the fields it actually
 * reads, and remembers what it was asked. */
/* eslint-disable @typescript-eslint/no-explicit-any */
const save = async ({
  context = {},
  general = { homeHeroImage: HERO },
  id = HERO,
  operation = 'update',
}: Save = {}) => {
  const findGlobal = vi.fn(async () => {
    if (general instanceof Error) throw general

    return general
  })
  const logger = { error: vi.fn(), info: vi.fn() }
  const doc = { id, filename: 'ezgif-54afd13ceb7dfbf9.webp' }

  const returned = await (revalidateMedia as any)({
    collection: {},
    context,
    doc,
    operation,
    previousDoc: { id, filename: 'optimized-image (1).webp' },
    req: { context, payload: { findGlobal, logger } },
  })

  return { doc, findGlobal, logger, returned }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

beforeEach(() => {
  revalidateTag.mockClear()
})

describe('revalidateMedia, for the home page’s hero', () => {
  /*
   * The hero is read through the cached `general` global, which holds a copy of
   * this document. Replacing the file leaves the global's own fields as they
   * were, so nothing else expires that copy — and the replacement deletes the
   * files it names.
   */
  it('expires the settings when the file behind the hero is replaced', async () => {
    await save()

    expect(revalidateTag).toHaveBeenCalledWith('global_general', { expire: 0 })
  })

  /* Expiring the settings re-renders the home page and every gated post, which
   * is not a price to pay for a picture the hero does not show. */
  it('leaves the settings alone for any other picture', async () => {
    await save({ id: 7 })

    expect(revalidateTag).not.toHaveBeenCalledWith('global_general', expect.anything())
  })

  it('leaves them alone while the hero is unset', async () => {
    await save({ general: { homeHeroImage: null } })

    expect(revalidateTag).not.toHaveBeenCalledWith('global_general', expect.anything())
  })

  /* Nothing can name a document that is only now being created. */
  it('does not ask about an upload that is being created', async () => {
    const { findGlobal } = await save({ operation: 'create' })

    expect(findGlobal).not.toHaveBeenCalled()
  })

  /* What lets the import scripts write outside a Next request, where the call
   * throws. */
  it('stands down when the write asks it to', async () => {
    const { findGlobal } = await save({ context: { disableRevalidate: true } })

    expect(findGlobal).not.toHaveBeenCalled()
    expect(revalidateTag).not.toHaveBeenCalled()
  })

  /* The upload has been saved by the time this runs; a failed lookup is logged
   * rather than turned into an error on a save that worked. */
  it('keeps the save when the settings cannot be read', async () => {
    const { doc, logger, returned } = await save({ general: new Error('connection reset') })

    expect(returned).toBe(doc)
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(revalidateTag).not.toHaveBeenCalledWith('global_general', expect.anything())
  })

  it('hands the document back', async () => {
    const { doc, returned } = await save()

    expect(returned).toBe(doc)
  })
})
