import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeDeleteHook,
  PayloadRequest,
  Where,
} from 'payload'

import { revalidatePath } from 'next/cache'

import { SITEMAP_PATH } from '@/seo/sitemap'
import { isProgramEntry, NEWS_BASE, postPath, PROGRAMS_BASE } from '@/utilities/postPath'

import type { Post } from '../../../payload-types'

/**
 * The numbered pages of the Actualités listing, by their route file: Next tags
 * a cached page with its file's path, `(frontend)` group included, so the
 * pattern has to name it. One pattern covers every page number without a
 * count, and refreshes nothing until somebody asks for a page.
 *
 * Every page rather than the one the post sits on: a post published,
 * unpublished or deleted shifts each post after it by one, so every later page
 * changes, and a new last page may appear.
 */
export const NEWS_PAGES = '/(frontend)/news/page/[pageNumber]'

/**
 * Every page a post shows up on: its own, the index of the section it belongs
 * to, and — for a programme entry — the home page, which carries the nearest
 * few. Revalidating only the post's own page leaves an editor looking at a
 * listing that still holds the previous title, and those listings have no timer
 * behind them to catch it later.
 */
const pathsFor = (post: Partial<Post>) => {
  const own = postPath({ schedule: post.schedule, slug: post.slug ?? '' })

  return isProgramEntry(post) ? [own, PROGRAMS_BASE, '/'] : [own, NEWS_BASE]
}

/**
 * The pages that draw a post's uploads and its authors, which is fewer: the
 * programme listings print neither, while a news card shows the picture and the
 * names.
 */
const pathsDrawing = (post: Partial<Post>) => {
  const own = postPath({ schedule: post.schedule, slug: post.slug ?? '' })

  return isProgramEntry(post) ? [own] : [own, NEWS_BASE]
}

/** The Actualités listing is `/news` and its numbered pages, one listing. */
const refresh = (paths: Iterable<string>) => {
  const unique = new Set(paths)

  for (const path of unique) revalidatePath(path)

  if (unique.has(NEWS_BASE)) revalidatePath(NEWS_PAGES, 'page')
}

const revalidate = (paths: Iterable<string>) => {
  refresh(paths)

  revalidatePath(SITEMAP_PATH)
}

const published = { _status: { equals: 'published' } } as const

/**
 * The pages of every published post listing one of these among its related
 * posts: each draws a card of them, with title, picture and authors.
 *
 * Inside the write's own transaction, through `req`, like every other Local API
 * call in a hook.
 */
const pathsRelatingTo = async (ids: (number | string)[], req: PayloadRequest) => {
  if (ids.length === 0) return []

  const { docs } = await req.payload.find({
    collection: 'posts',
    depth: 0,
    pagination: false,
    req,
    select: { schedule: true, slug: true },
    where: { and: [published, { relatedPosts: { in: ids } }] },
  })

  return docs.map((post) => postPath(post))
}

/**
 * The pages drawing the published posts that match `where`.
 *
 * For writes to what a post points at rather than to the post: an upload it
 * shows, a user it names as author. Those leave the post untouched, so its own
 * hook never runs, and the pages that drew them have no timer to catch up on.
 * Split from the refresh so a delete can ask before the rows it would find are
 * gone.
 */
export const pathsShowingPosts = async (req: PayloadRequest, where: Where) => {
  const { docs } = await req.payload.find({
    collection: 'posts',
    depth: 0,
    pagination: false,
    req,
    select: { schedule: true, slug: true },
    where: { and: [published, where] },
  })

  if (docs.length === 0) return []

  return [
    ...docs.flatMap(pathsDrawing),
    ...(await pathsRelatingTo(
      docs.map((post) => post.id),
      req,
    )),
  ]
}

/** Refresh what `pathsShowingPosts` found, now or after a delete. */
export const refreshPostPages = (req: PayloadRequest, paths: string[]) => {
  if (paths.length === 0) return

  req.payload.logger.info(`Revalidating ${[...new Set(paths)].join(', ')}`)
  refresh(paths)
}

export const revalidatePost: CollectionAfterChangeHook<Post> = async ({
  doc,
  previousDoc,
  req,
}) => {
  const { context, payload } = req

  if (context.disableRevalidate) return doc

  const paths: string[] = []

  if (doc._status === 'published') paths.push(...pathsFor(doc))

  /**
   * The previous version's pages too, whenever it was live somewhere else:
   * unpublished, renamed, or given a date, which moves it from /news to
   * /programs and leaves the old listing holding an entry that is gone.
   */
  if (previousDoc?._status === 'published') paths.push(...pathsFor(previousDoc))

  if (paths.length === 0) return doc

  /* And the posts that list it as related, whose cards carry its title, its
   * picture and its address. */
  paths.push(...(await pathsRelatingTo([doc.id], req)))

  payload.logger.info(`Revalidating ${[...new Set(paths)].join(', ')}`)
  revalidate(paths)

  return doc
}

/** Where `noteRelatedBeforeDelete` leaves word for `revalidateDelete`. */
const RELATED_BEING_DELETED = 'postsRelatingToDeleted'

/**
 * Asked before the delete, because afterwards there is nobody left to ask: the
 * database drops the related-post rows with the post, so a page that drew a
 * card for it can no longer be found by it. A list per request, since one
 * request can delete several posts.
 */
export const noteRelatedBeforeDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  if (req.context.disableRevalidate) return

  const noted = (req.context[RELATED_BEING_DELETED] ??= []) as string[]

  noted.push(...(await pathsRelatingTo([id], req)))
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidate([...pathsFor(doc), ...((context[RELATED_BEING_DELETED] as string[]) ?? [])])
  }

  return doc
}
