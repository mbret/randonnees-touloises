import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidatePath = vi.fn()
const revalidateTag = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
}))

const { revalidateDelete, revalidatePage } =
  await import('@/collections/Pages/hooks/revalidatePage')

type Doc = { _status?: string; slug?: string; title?: string; [k: string]: unknown }

const req = { payload: { logger: { info: () => {} } }, context: {} }

/* The hooks want a full Payload request; these tests give them the three fields
 * they actually read. */
/* eslint-disable @typescript-eslint/no-explicit-any */
const change = (doc: Doc, previousDoc?: Doc, context: object = {}) =>
  (revalidatePage as any)({
    collection: {},
    doc,
    operation: 'update',
    previousDoc,
    req: { ...req, context },
  } as any)

const remove = (doc: Doc) => (revalidateDelete as any)({ collection: {}, doc, req } as any)
/* eslint-enable @typescript-eslint/no-explicit-any */

beforeEach(() => {
  revalidatePath.mockClear()
  revalidateTag.mockClear()
})

describe('revalidatePage', () => {
  /*
   * The regression this file exists for: opening the create view makes Payload
   * write an autosave draft during the render, and Next refuses revalidation
   * from inside one. Touching the header tag there rendered the view blank.
   */
  it('leaves the caches alone when a draft is created', () => {
    change({ _status: 'draft', slug: 'brouillon', title: 'Brouillon' })

    expect(revalidateTag).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('leaves them alone when a draft is edited', () => {
    change(
      { _status: 'draft', slug: 'brouillon', title: 'Brouillon reécrit' },
      { _status: 'draft', slug: 'brouillon', title: 'Brouillon' },
    )

    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('refreshes the menu and the page when one is published', () => {
    change({ _status: 'published', slug: 'devenir-animateur', title: 'Devenir animateur' })

    expect(revalidateTag).toHaveBeenCalledWith('global_header', { expire: 0 })
    expect(revalidatePath).toHaveBeenCalledWith('/devenir-animateur')
  })

  it('refreshes the menu when a published page is unpublished', () => {
    change(
      { _status: 'draft', slug: 'devenir-animateur', title: 'Devenir animateur' },
      { _status: 'published', slug: 'devenir-animateur', title: 'Devenir animateur' },
    )

    expect(revalidateTag).toHaveBeenCalledWith('global_header', { expire: 0 })
  })

  it('refreshes the menu when a published page is retitled', () => {
    change(
      { _status: 'published', slug: 'devenir-animateur', title: 'Nous recrutons' },
      { _status: 'published', slug: 'devenir-animateur', title: 'Devenir animateur' },
    )

    expect(revalidateTag).toHaveBeenCalledWith('global_header', { expire: 0 })
  })

  // Autosave writes on a 100ms timer, so a write that moves nothing the header
  // reads must not refresh the menu.
  it('leaves the menu alone when a published page changes nothing the header reads', () => {
    const unchanged = {
      _status: 'published',
      slug: 'devenir-animateur',
      title: 'Devenir animateur',
    }

    change({ ...unchanged, publishedAt: '2026-02-03' }, unchanged)

    expect(revalidateTag).not.toHaveBeenCalled()
  })

  it('refreshes the menu when a page is deleted', () => {
    remove({ _status: 'published', slug: 'devenir-animateur', title: 'Devenir animateur' })

    expect(revalidateTag).toHaveBeenCalledWith('global_header', { expire: 0 })
  })

  it('does nothing at all when revalidation is disabled, as the import scripts ask', () => {
    change(
      { _status: 'published', slug: 'devenir-animateur', title: 'Devenir animateur' },
      undefined,
      { disableRevalidate: true },
    )

    expect(revalidateTag).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
