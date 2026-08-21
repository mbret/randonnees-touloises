import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import { pagePath } from '@/utilities/pagePath'
import { SITEMAP_PATH } from '@/seo/sitemap'

import type { Page } from '../../../payload-types'

/**
 * What the header reads off a page, and so what the menu can go stale on.
 *
 * The menu is derived from the collection rather than copied into the Header
 * global, which means a page changing can change the menu — including going
 * unpublished, which removes an entry. Autosave writes on a 100ms timer though,
 * so refreshing on every write would refresh the menu about once per keystroke.
 * Compare these instead and refresh only when one of them actually moved.
 */
const navFields = ['title', 'slug', 'showInNav', 'navLabel', 'navOrder', '_status'] as const

/**
 * Whether this write can have changed the menu.
 *
 * Only published pages are in it, so a page that is a draft and was one cannot
 * have moved it. That is not merely wasted work: opening the create view makes
 * Payload write an autosave draft *during the render*, and Next refuses
 * `revalidateTag` during a render — it threw there, and the view rendered blank.
 * Declining draft-only writes is what keeps that view working, and the sibling
 * `revalidatePost` earns the same protection by returning early when it finds
 * nothing published to refresh.
 */
const affectsNav = (doc: Page, previousDoc?: Page) => {
  const published = doc._status === 'published'
  const wasPublished = previousDoc?._status === 'published'

  if (!published && !wasPublished) return false

  return !previousDoc || navFields.some((field) => doc[field] !== previousDoc[field])
}

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = pagePath(doc)

      payload.logger.info(`Revalidating page at path: ${path}`)

      revalidatePath(path)
      revalidatePath(SITEMAP_PATH)
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = pagePath(previousDoc)

      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      revalidatePath(oldPath)
      revalidatePath(SITEMAP_PATH)
    }

    if (affectsNav(doc, previousDoc)) {
      payload.logger.info(`Revalidating header for page: ${doc.slug}`)

      revalidateTag('global_header', { expire: 0 })
    }
  }

  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = pagePath(doc)
    revalidatePath(path)
    revalidatePath(SITEMAP_PATH)

    /* Unconditional: a deleted page has to leave the menu. */
    revalidateTag('global_header', { expire: 0 })
  }

  return doc
}
