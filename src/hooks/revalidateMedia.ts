import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

import { revalidateTag } from 'next/cache'

import { SITE_ASSET_FILENAMES } from '@/metadata/siteAssets'

/**
 * Expire the site assets when the document behind one is replaced.
 *
 * `getCachedMedias` holds the logo, the favicon and the post placeholder under
 * the `medias` tag with no `revalidate` of its own, so without this they are
 * held until a deploy. That was survivable while a replaced file kept its URL;
 * it is not now. `ImageMedia` reads the generated sizes off the document to
 * build its `srcset`, and a cached document carries the rungs it had when it
 * was cached — so once the files behind those are replaced, the `<source>`
 * points at URLs that are gone.
 *
 * A failed `<source>` is not recoverable, which is what makes this worth a
 * hook rather than a note: the browser commits to a source once its `type` and
 * `media` match, and does not fall back to the `<img>` beneath when the URL it
 * chose 404s. The image is simply broken until the tag expires.
 *
 * Scoped to the filenames that cache actually holds. Anything else in the
 * collection is read through the page or post that references it, and expiring
 * `medias` for those would be 249 pointless invalidations during a backfill —
 * which is also why the backfill ends by asking for a redeploy rather than
 * relying on this. A cached *page* embeds the same rung URLs and no media hook
 * reaches it — the home page's hero aside, below.
 */
const revalidateSiteAssets = (filename?: null | string) => {
  if (!filename || !SITE_ASSET_FILENAMES.includes(filename)) return

  revalidateTag('medias', { expire: 0 })
}

/**
 * Expire the home page's settings when the document behind its hero changes.
 *
 * The hero is read through the `general` global at depth 1, so the cached
 * global holds a copy of this document — filename, rungs, and the `updatedAt`
 * its URLs are tagged with — as it stood when the global was cached. Replacing
 * the file here changes none of the global's own fields, so the global's hook
 * never runs, and that copy goes on naming files the replacement has deleted
 * from the bucket. It shipped that way: a club member replaced the hero's file,
 * the home page kept rendering the old one, and those URLs answered 404 to
 * anyone the CDN had no copy for.
 *
 * Asked of the global rather than done on every save: expiring its tag
 * re-renders the home page and every gated post, a price worth paying for the
 * one picture the hero shows and not for each of the others. A document being
 * created cannot be the hero yet, so only an update asks.
 */
const revalidateHomeHero = async (req: PayloadRequest, id: number | string) => {
  try {
    const { homeHeroImage } = await req.payload.findGlobal({ slug: 'general', depth: 0, req })
    const heroId = typeof homeHeroImage === 'object' ? homeHeroImage?.id : homeHeroImage

    if (heroId === id) revalidateTag('global_general', { expire: 0 })
  } catch (error) {
    /* The save has happened by now; a lookup that fails should cost the club a
     * stale hero, which saving the settings fixes, rather than an error on an
     * upload that worked. */
    req.payload.logger.error({ err: error, msg: 'Could not check whether the home hero changed' })
  }
}

export const revalidateMedia: CollectionAfterChangeHook = async ({
  doc,
  operation,
  previousDoc,
  req,
}) => {
  if (!req.context.disableRevalidate) {
    revalidateSiteAssets(doc?.filename)

    /* A rename moves the asset out from under the cached copy as surely as a
     * replacement does, so the name it had counts too. */
    if (previousDoc?.filename !== doc?.filename) revalidateSiteAssets(previousDoc?.filename)

    if (operation === 'update') await revalidateHomeHero(req, doc.id)
  }

  return doc
}

export const revalidateMediaDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) revalidateSiteAssets(doc?.filename)

  return doc
}
