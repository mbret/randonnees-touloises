import { existsSync } from 'node:fs'
import path from 'node:path'

import { beforeEach, describe, expect, it, vi } from 'vitest'

const revalidatePath = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  revalidateTag: vi.fn(),
}))

const { NEWS_PAGES, noteRelatedBeforeDelete, revalidateDelete, revalidatePost } =
  await import('@/collections/Posts/hooks/revalidatePost')

type Doc = { [k: string]: unknown }

/** The published posts the database would say list the post as related. */
const find = vi.fn(async () => ({ docs: [] as Doc[] }))

const request = (context: object = {}) => ({
  context: { ...context },
  payload: { find, logger: { info: () => {} } },
})

/* The hooks want full Payload arguments; these tests give them the fields they
 * actually read. */
/* eslint-disable @typescript-eslint/no-explicit-any */
const change = (doc: Doc, previousDoc?: Doc, context: object = {}) =>
  (revalidatePost as any)({
    collection: {},
    doc,
    operation: 'update',
    previousDoc,
    req: request(context),
  } as any)

const remove = async (doc: Doc) => {
  const req = request()

  await (noteRelatedBeforeDelete as any)({ collection: {}, id: doc.id, req } as any)
  await (revalidateDelete as any)({ collection: {}, doc, id: doc.id, req } as any)
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const news = (overrides: Doc = {}): Doc => ({
  _status: 'published',
  id: 4,
  schedule: {},
  slug: 'assemblee-generale',
  ...overrides,
})

const programme = (overrides: Doc = {}): Doc => ({
  _status: 'published',
  id: 5,
  schedule: { startDate: '2026-11-08T23:00:00.000Z' },
  slug: 'sortie-a-foug',
  ...overrides,
})

const refreshedNewsPages = () =>
  revalidatePath.mock.calls.some(([route, type]) => route === NEWS_PAGES && type === 'page')

beforeEach(() => {
  revalidatePath.mockClear()
  find.mockClear()
  find.mockResolvedValue({ docs: [] })
})

describe('the numbered pages of the Actualités listing', () => {
  /*
   * The gap the ten-minute timer hid: /news was refreshed and /news/page/2 was
   * not, so a published post showed on page one and the post it pushed off the
   * end was on neither, until the timer came round.
   */
  it('are refreshed with /news when a news post is published', async () => {
    await change(news(), news({ _status: 'draft' }))

    expect(revalidatePath).toHaveBeenCalledWith('/news')
    expect(refreshedNewsPages()).toBe(true)
  })

  it('are refreshed when a news post is unpublished', async () => {
    await change(news({ _status: 'draft' }), news())

    expect(refreshedNewsPages()).toBe(true)
  })

  it('are refreshed when a news post is deleted', async () => {
    await remove(news())

    expect(refreshedNewsPages()).toBe(true)
  })

  /* Gaining a date moves it out of the Actualités, and shifts what follows. */
  it('are refreshed when a news post becomes a programme entry', async () => {
    await change(programme({ slug: 'assemblee-generale' }), news())

    expect(revalidatePath).toHaveBeenCalledWith('/programs/assemblee-generale')
    expect(refreshedNewsPages()).toBe(true)
  })

  it('are left alone for a programme entry', async () => {
    await change(programme(), programme())

    expect(revalidatePath).toHaveBeenCalledWith('/programs')
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(refreshedNewsPages()).toBe(false)
  })

  it('are left alone for a draft nobody has published', async () => {
    await change(news({ _status: 'draft' }), news({ _status: 'draft' }))

    expect(revalidatePath).not.toHaveBeenCalled()
    expect(find).not.toHaveBeenCalled()
  })

  it('are left alone when the caller asked for no revalidation', async () => {
    await change(news(), news(), { disableRevalidate: true })

    expect(revalidatePath).not.toHaveBeenCalled()
  })

  /*
   * The pattern refreshes nothing, and says nothing, if no route file has
   * that path: Next tags a page with its file's path, route group included.
   */
  it('name the route file that renders them', () => {
    expect(existsSync(path.join('src/app', NEWS_PAGES, 'page.tsx'))).toBe(true)
  })
})

describe('the posts that list a post as related', () => {
  it('are refreshed when it changes', async () => {
    find.mockResolvedValueOnce({ docs: [programme({ slug: 'sejour-dans-les-vosges' })] })

    await change(news({ slug: 'assemblee-generale-2026' }), news())

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'posts',
        req: expect.anything(),
        where: { and: [{ _status: { equals: 'published' } }, { relatedPosts: { in: [4] } }] },
      }),
    )
    expect(revalidatePath).toHaveBeenCalledWith('/programs/sejour-dans-les-vosges')
  })

  /*
   * Asked before the delete: the database takes the related-post rows with
   * the post, so afterwards nothing would find them.
   */
  it('are found before it is deleted, and refreshed after', async () => {
    find.mockResolvedValueOnce({ docs: [programme({ slug: 'sejour-dans-les-vosges' })] })

    await remove(news())

    expect(revalidatePath).toHaveBeenCalledWith('/programs/sejour-dans-les-vosges')
    expect(revalidatePath).toHaveBeenCalledWith('/news/assemblee-generale')
  })
})
