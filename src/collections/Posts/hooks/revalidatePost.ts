import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import { isProgramEntry, NEWS_BASE, postPath, PROGRAMS_BASE } from '@/utilities/postPath'

import type { Post } from '../../../payload-types'

/**
 * Every page a post shows up on: its own, the index of the section it belongs
 * to, and — for a programme entry — the home page, which carries the nearest
 * few. Revalidating only the post's own page leaves an editor looking at a
 * listing that still holds the previous title for up to an hour.
 */
const pathsFor = (post: Partial<Post>) => {
  const own = postPath({ schedule: post.schedule, slug: post.slug ?? '' })

  return isProgramEntry(post) ? [own, PROGRAMS_BASE, '/'] : [own, NEWS_BASE]
}

const revalidate = (paths: Iterable<string>) => {
  for (const path of new Set(paths)) revalidatePath(path)

  revalidateTag('posts-sitemap', { expire: 0 })
}

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
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

  payload.logger.info(`Revalidating ${[...new Set(paths)].join(', ')}`)
  revalidate(paths)

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) revalidate(pathsFor(doc))

  return doc
}
