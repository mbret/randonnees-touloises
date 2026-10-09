import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeDeleteHook,
  PayloadRequest,
} from 'payload'

import { revalidateTag } from 'next/cache'

import { revalidatePagesShowingAdherents } from '@/collections/Adherents/hooks/revalidateAdherentPages'
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
 * relying on this. A cached page embeds the same rung URLs, and the only pages
 * a media hook reaches are the ones drawing adhérents' portraits and the home
 * page's hero, below.
 */
const revalidateSiteAssets = (filename?: null | string) => {
  if (!filename || !SITE_ASSET_FILENAMES.includes(filename)) return

  revalidateTag('medias', { expire: 0 })
}

/**
 * Whether a page currently shows this upload as somebody's portrait.
 *
 * Those pages are the exception to « a page refreshes when it is saved »: the
 * trombinoscope and the profile cards read their portraits off the adhérents,
 * so replacing a portrait's file in the media library changes them without
 * anyone saving either. Only a portrait shown with permission counts — without
 * « Portrait » ticked no page draws it.
 */
const isShownPortrait = async (id: number | string, req: PayloadRequest) => {
  const { totalDocs } = await req.payload.count({
    collection: 'adherents',
    req,
    where: { and: [{ photo: { equals: id } }, { 'publicationConsent.photo': { equals: true } }] },
  })

  return totalDocs > 0
}

/**
 * Whether this upload is the home page's hero.
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
 * Asked of the global rather than expired on every save: expiring its tag
 * re-renders the home page and every gated post, a price worth paying for the
 * one picture the hero shows and not for each of the others.
 */
const isHomeHero = async (id: number | string, req: PayloadRequest) => {
  try {
    const { homeHeroImage } = await req.payload.findGlobal({ slug: 'general', depth: 0, req })
    const heroId = typeof homeHeroImage === 'object' ? homeHeroImage?.id : homeHeroImage

    /* As strings: the REST API parses an id from its URL, but the local API
     * hands a hook whichever kind its caller passed. */
    return heroId != null && String(heroId) === String(id)
  } catch (error) {
    /* A lookup that fails should cost the club a stale hero, which saving the
     * settings fixes, rather than an error on a save or a delete that would
     * otherwise have worked. */
    req.payload.logger.error({ err: error, msg: 'Could not check whether the home hero changed' })

    return false
  }
}

/** Expire the cached settings the home page reads its hero through. */
const revalidateHomeHero = () => revalidateTag('global_general', { expire: 0 })

/**
 * Any write to a portrait's document refreshes the pages that draw it: a new
 * file renames the rungs out from under the cached `srcset`, and even an
 * edited alt text or crop reaches a profile card. The same goes for the home
 * page's hero. A new upload cannot be anybody's portrait or the hero yet, so a
 * creation is left alone.
 */
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

    if (operation === 'update' && (await isShownPortrait(doc.id, req))) {
      await revalidatePagesShowingAdherents(req)
    }

    if (operation === 'update' && (await isHomeHero(doc.id, req))) revalidateHomeHero()
  }

  return doc
}

/** Where `notePortraitDelete` leaves word for `revalidateMediaDelete`. */
const PORTRAITS_BEING_DELETED = 'portraitsBeingDeleted'

/** Where it leaves the id of the home page's hero, when that is going too. */
const HERO_BEING_DELETED = 'homeHeroBeingDeleted'

const portraitsBeingDeleted = (req: PayloadRequest) =>
  (req.context[PORTRAITS_BEING_DELETED] ??= new Set<number | string>()) as Set<number | string>

/**
 * Asked before the delete, because afterwards there is nobody left to ask.
 *
 * The adhérent's `photo` is cleared by the database — `ON DELETE SET NULL` —
 * not by Payload, so no adhérent hook runs, and by the time `afterDelete` does
 * the reference it would look for is already gone. A set rather than a flag,
 * since deleting several uploads at once runs these hooks per document on one
 * request.
 *
 * The home page's hero goes the same way — `general.homeHeroImage` is cleared
 * by the same rule, and the global's hook never hears of it — so this notes
 * that too: the hook is named for the portraits it was written for.
 */
export const notePortraitDelete: CollectionBeforeDeleteHook = async ({ id, req }) => {
  if (req.context.disableRevalidate) return

  if (await isShownPortrait(id, req)) portraitsBeingDeleted(req).add(id)

  if (await isHomeHero(id, req)) req.context[HERO_BEING_DELETED] = id
}

export const revalidateMediaDelete: CollectionAfterDeleteHook = async ({ doc, id, req }) => {
  if (!req.context.disableRevalidate) {
    revalidateSiteAssets(doc?.filename)

    /* The person drops off the trombinoscope, and a profile card falls back to
     * initials, rather than either keeping a picture that no longer exists. */
    if (portraitsBeingDeleted(req).has(id)) await revalidatePagesShowingAdherents(req)

    /* Likewise the home page draws its stand-in, as it does with no hero
     * chosen, rather than go on naming files the delete took away. */
    if (req.context[HERO_BEING_DELETED] === id) revalidateHomeHero()
  }

  return doc
}
