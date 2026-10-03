import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  PayloadRequest,
  Where,
} from 'payload'

import { revalidatePath } from 'next/cache'

import type { Adherent } from '@/payload-types'

import { pagePath } from '@/utilities/pagePath'

/**
 * The blocks that draw adhérents onto a page, and so the pages an edit to a
 * fiche can change without anyone touching the page itself.
 *
 * A page is otherwise only rebuilt when it is saved or the site is deployed:
 * `/[slug]` is prerendered and revalidates on demand alone. That was enough
 * while every block drew from the page's own document; these two draw from
 * `adherents`, so a portrait added or a permission withdrawn would wait for the
 * next deploy to show — and a withdrawn permission is exactly the change that
 * must not wait.
 */
export const BLOCKS_SHOWING_ADHERENTS = ['profileCards', 'trombinoscope'] as const

/**
 * Every page carrying one of them. An `or` of equalities rather than one `in`:
 * on Postgres an `in` over two block types matches no page at all, while each
 * equality finds its own.
 */
const showingAdherents: Where = {
  or: BLOCKS_SHOWING_ADHERENTS.map((blockType) => ({ 'layout.blockType': { equals: blockType } })),
}

/** A relationship arrives as an id or as the document, depending on depth. */
const idOf = (value: Adherent['photo'] | undefined) =>
  value && typeof value === 'object' ? value.id : (value ?? null)

/**
 * Everything those blocks can draw from one fiche, in one comparable value.
 *
 * The trombinoscope reads the first name and the portrait; the profile cards
 * add the surname, the function and the telephone. Each consent is in it,
 * because ticking or unticking one is what puts a portrait or a number on a
 * page, or takes it off again.
 */
const shown = (adherent: Partial<Adherent> | undefined) =>
  JSON.stringify([
    adherent?.firstName ?? null,
    adherent?.lastName ?? null,
    adherent?.boardRole ?? null,
    adherent?.phone ?? null,
    idOf(adherent?.photo),
    Boolean(adherent?.publicationConsent?.photo),
    Boolean(adherent?.publicationConsent?.phone),
  ])

/** On the trombinoscope from the moment they exist, nobody having added them. */
const onTrombinoscope = (adherent: Partial<Adherent>) =>
  Boolean(adherent.publicationConsent?.photo && idOf(adherent.photo))

/**
 * Whether this write can have changed a page.
 *
 * A new adhérent can only be on the trombinoscope — a list of profile cards
 * names its people, and cannot name someone who did not exist yet — so a
 * creation counts only when it qualifies for that. Which is also why the CSV
 * import's new members, who arrive with neither a portrait nor a permission,
 * refresh nothing. An edit counts when it moves anything a card draws: an
 * address, a licence or a certificate date does not.
 */
const affectsPages = (
  doc: Adherent,
  previousDoc: Adherent | undefined,
  operation: 'create' | 'update',
) => (operation === 'create' ? onTrombinoscope(doc) : shown(doc) !== shown(previousDoc))

/**
 * Found when needed rather than named here: which page carries the
 * trombinoscope, and under what slug, is the editor's choice.
 *
 * Inside the write's own transaction, through `req`, like every other Local API
 * call in a hook.
 */
const revalidatePagesShowingAdherents = async (req: PayloadRequest) => {
  const { docs } = await req.payload.find({
    collection: 'pages',
    depth: 0,
    pagination: false,
    req,
    select: { slug: true },
    where: showingAdherents,
  })

  for (const page of docs) {
    if (!page.slug) continue

    const path = pagePath(page)

    req.payload.logger.info(`Revalidating page at path: ${path}`)

    revalidatePath(path)
  }
}

export const revalidateAdherentPages: CollectionAfterChangeHook<Adherent> = async ({
  doc,
  operation,
  previousDoc,
  req,
}) => {
  if (!req.context.disableRevalidate && affectsPages(doc, previousDoc, operation)) {
    await revalidatePagesShowingAdherents(req)
  }

  return doc
}

/**
 * Unconditional, as in the sibling collections: there is no second state to
 * compare against, and a person removed from the roster has to leave every
 * page that showed them — Postgres has already dropped them from any list of
 * profile cards, but the pages still hold the copy rendered before.
 */
export const revalidateAdherentPagesDelete: CollectionAfterDeleteHook<Adherent> = async ({
  doc,
  req,
}) => {
  if (!req.context.disableRevalidate) await revalidatePagesShowingAdherents(req)

  return doc
}
