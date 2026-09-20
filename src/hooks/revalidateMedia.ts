import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

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
 * reaches it.
 */
const revalidateSiteAssets = (filename?: null | string) => {
  if (!filename || !SITE_ASSET_FILENAMES.includes(filename)) return

  revalidateTag('medias', { expire: 0 })
}

export const revalidateMedia: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidateSiteAssets(doc?.filename)

    /* A rename moves the asset out from under the cached copy as surely as a
     * replacement does, so the name it had counts too. */
    if (previousDoc?.filename !== doc?.filename) revalidateSiteAssets(previousDoc?.filename)
  }

  return doc
}

export const revalidateMediaDelete: CollectionAfterDeleteHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) revalidateSiteAssets(doc?.filename)

  return doc
}
