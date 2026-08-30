import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidatePath = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  revalidateTag: vi.fn(),
}))

const { revalidateEvent, revalidateEventDelete } =
  await import('@/collections/Events/hooks/revalidateEvent')

type Doc = { _status?: string; date?: string; title?: string; [k: string]: unknown }

const req = { payload: { logger: { info: () => {} } }, context: {} }

/* The hooks want a full Payload request; these tests give them the three fields
 * they actually read. */
/* eslint-disable @typescript-eslint/no-explicit-any */
const change = (doc: Doc, previousDoc?: Doc, context: object = {}) =>
  (revalidateEvent as any)({
    collection: {},
    doc,
    operation: 'update',
    previousDoc,
    req: { ...req, context },
  } as any)

const remove = (doc: Doc) => (revalidateEventDelete as any)({ collection: {}, doc, req } as any)
/* eslint-enable @typescript-eslint/no-explicit-any */

const event = (overrides: Doc = {}): Doc => ({
  date: '2026-09-12T08:30:00.000Z',
  title: 'Sortie à Écrouves',
  ...overrides,
})

beforeEach(() => {
  revalidatePath.mockClear()
})

describe('revalidateEvent', () => {
  /*
   * The whole point of the guard: the collection answers a public read with
   * `_status: published`, so a draft is not in the agenda and writing one
   * cannot have changed it. Refreshing anyway dropped the home page's cached
   * copy, and the next visitor paid for a full re-render of it.
   */
  it('leaves the agenda alone when a draft is created', () => {
    change(event({ _status: 'draft' }))

    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('leaves it alone when a draft is edited', () => {
    change(
      event({ _status: 'draft', title: 'Sortie à Écrouves (corrigée)' }),
      event({ _status: 'draft' }),
    )

    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('refreshes it when an event is published', () => {
    change(event({ _status: 'published' }), event({ _status: 'draft' }))

    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  it('refreshes it when a published event is edited', () => {
    change(event({ _status: 'published', title: 'Sortie à Foug' }), event({ _status: 'published' }))

    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  /* Otherwise the event stays on the page until the hourly re-render. */
  it('refreshes it when a published event is unpublished', () => {
    change(event({ _status: 'draft' }), event({ _status: 'published' }))

    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  /* Scheduled publish writes the same status change the button does. */
  it('refreshes it when a scheduled publish lands', () => {
    change(event({ _status: 'published' }))

    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  it('declines when the caller asked for no revalidation', () => {
    change(event({ _status: 'published' }), event({ _status: 'published' }), {
      disableRevalidate: true,
    })

    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('refreshes it when an event is deleted', () => {
    remove(event({ _status: 'published' }))

    expect(revalidatePath).toHaveBeenCalledWith('/')
  })
})
