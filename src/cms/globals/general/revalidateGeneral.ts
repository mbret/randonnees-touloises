import type { GlobalAfterChangeHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import { NEWS_BASE, PROGRAMS_BASE } from '@/utilities/postPath'

/**
 * Nothing invalidated this global, so an edit to it was picked up only whenever
 * the cached read happened to be dropped — which for the content password meant
 * waiting for a deploy. The header and the footer have each had a hook of their
 * own all along; this is the one that was missing.
 */
export const revalidateGeneral: GlobalAfterChangeHook = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (context.disableRevalidate) return doc

  payload.logger.info('Revalidating the general settings')

  revalidateTag('global_general', { expire: 0 })

  /**
   * Whether a password exists at all is what decides if the post pages can be
   * prerendered — `WithContentProtectedPassword` reaches for the cookie only
   * once one is set. Turning it on or off therefore has to rebuild those pages
   * as well as drop the cached read above.
   *
   * Replacing one password with another does not: those pages are already being
   * rendered per request, and they read the new value through the tag.
   */
  const gated = Boolean(doc?.contentPassword)

  if (gated !== Boolean(previousDoc?.contentPassword)) {
    payload.logger.info(`Content password ${gated ? 'set' : 'cleared'}: rebuilding the post pages`)

    revalidatePath(`${NEWS_BASE}/[slug]`, 'page')
    revalidatePath(`${PROGRAMS_BASE}/[slug]`, 'page')
  }

  return doc
}
