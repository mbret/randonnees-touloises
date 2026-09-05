/**
 * Build the conseil d'administration page from the adhérents collection.
 *
 *   DRY_RUN=1 pnpm payload run scripts/build-board-page.ts
 *   pnpm payload run scripts/build-board-page.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 \
 *     pnpm payload run scripts/build-board-page.ts
 *
 * It writes one document: the page at slug `board`, published, carrying a
 * `profileCards` block with the conseil in it.
 *
 * It writes nothing else. Who sits on the conseil, what each person's function
 * is called, which portrait is theirs and whether it may be shown are all
 * already recorded on the adhérents, and this only reads them — the conseil is
 * everyone with a `boardRole`, and each card renders from that person's own
 * record. Change the conseil in the admin and run this again.
 *
 * ORDER. The block holds it, dragged into shape, because the club reads its
 * conseil président, vice-présidente, secrétaire, trésorier, the référents, then
 * the members — an order that is neither alphabetical nor derivable from the
 * documents. So this only has to pick a sensible starting one:
 *
 *   an order the page already has is kept, so re-running never undoes a drag;
 *   anyone new goes after it, in the order the old website listed them;
 *   anyone that list has never heard of goes last, alphabetically.
 *
 * `src/data/teams.ts` is read for that and for nothing else. It is the order the
 * site shows today, so a first run reproduces the current page rather than
 * inventing an arrangement; once the page exists, its own order wins.
 *
 * AND ONE THING IT CANNOT DO: make the page visible. `src/app/(frontend)/board`
 * is a route, and a route wins over `/[slug]`, so /board keeps serving the coded
 * page until that directory is deleted. Which is the point of the order —
 * running this changes nothing a visitor sees, and deleting the route then swaps
 * it in with no gap.
 *
 * That shadowing also swallows the admin's live preview, which points at /board
 * and so gets the coded page back whatever the draft holds; there is no
 * previewing this one in place. What does show it is the Vercel preview
 * deployment of the pull request that deletes the route: preview builds read the
 * production database (see `scripts/migrate-on-deploy.mjs`), so that URL renders
 * the real page, with the real people, without touching the live site.
 */
import type { Adherent } from '@/payload-types'

import { boardMembers } from '@/data/teams'

/**
 * The one spelling difference between the old website and the licence roster:
 * `teams.ts` came off the old site with one `l`, the federation's records have
 * two. Only used to line the two lists up for ordering — nothing is written.
 */
const ALIASES: Record<string, string> = { 'Abdelatif OUELDENNAOUA': 'Abdellatif OUELDENNAOUA' }

const PAGE = {
  description:
    'Les membres du conseil d’administration de l’association Randonnées Touloises et leurs fonctions.',
  lead: 'L’équipe qui administre l’association.',
  slug: 'board',
  title: 'Conseil d’administration',
}

const normalise = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '')

/** One key per person, from either spelling of their name. */
const keyOf = (adherent: Adherent) =>
  normalise(`${adherent.firstName ?? ''}${adherent.lastName ?? ''}`)

/** « Prénom NOM », the way the club prints it. */
const nameOf = (adherent: Adherent) =>
  [adherent.firstName, adherent.lastName].filter(Boolean).join(' ')

const text = (value: string) => ({
  type: 'text' as const,
  detail: 0,
  format: 0,
  mode: 'normal' as const,
  style: '',
  text: value,
  version: 1,
})

/**
 * The title and the strapline, as the hero rather than as a content block: only
 * the hero's editor allows an `h1`, and the page needs exactly one.
 */
const heroRichText = {
  root: {
    type: 'root',
    children: [
      {
        type: 'heading',
        children: [text(PAGE.title)],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        tag: 'h1',
        version: 1,
      },
      {
        type: 'paragraph',
        children: [text(PAGE.lead)],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        textFormat: 0,
        version: 1,
      },
    ],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
}

const describeTarget = () => {
  const url = process.env.POSTGRES_URL

  if (!url) return 'the database this config points at'

  try {
    return new URL(url).hostname
  } catch {
    return 'an unparseable POSTGRES_URL'
  }
}

const isLocal = (host: string) =>
  ['localhost', '127.0.0.1', '::1', 'host.docker.internal'].includes(host)

const main = async () => {
  const dryRun = process.env.DRY_RUN === '1'
  const target = describeTarget()

  if (!dryRun && !isLocal(target) && !process.env.ALLOW_REMOTE_DB) {
    console.error(
      `\nRefusing to write to ${target}: set ALLOW_REMOTE_DB=1 to build the page in a ` +
        `non-local database.`,
    )
    process.exit(1)
  }

  const { getPayload } = await import('payload')
  const config = (await import('@payload-config')).default
  const payload = await getPayload({ config })

  /**
   * The conseil, as the collection has it. `exists` leaves out the NULLs; the
   * filter below leaves out a role someone typed and then emptied, which comes
   * back as `''` and would otherwise put a blank card on the page.
   */
  const { docs } = await payload.find({
    collection: 'adherents',
    depth: 0,
    limit: 0,
    overrideAccess: true,
    pagination: false,
    select: {
      boardRole: true,
      firstName: true,
      lastName: true,
      photo: true,
      publicationConsent: true,
    },
    where: { boardRole: { exists: true } },
  })

  const conseil = (docs as Adherent[]).filter((adherent) => adherent.boardRole?.trim())

  if (conseil.length === 0) {
    console.error(
      `\nNo adhérent in ${target} has a « Fonction au conseil ». Fill that in on each member ` +
        `of the conseil — Adhérents → onglet Club — then run this again.`,
    )
    process.exit(1)
  }

  /** The page as it stands, if it stands: its member order is the one to keep. */
  const { docs: existing } = await payload.find({
    collection: 'pages',
    depth: 0,
    draft: true,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: PAGE.slug } },
  })

  const onPage: number[] = (existing[0]?.layout ?? []).flatMap((block) =>
    block.blockType === 'profileCards'
      ? (block.members ?? []).map((member) => (typeof member === 'object' ? member.id : member))
      : [],
  )

  const listed = boardMembers.map(({ name }) => normalise(ALIASES[name ?? ''] ?? name ?? ''))

  /**
   * Three tiers, then the name to break ties: already on the page, known to the
   * old website's list, and neither.
   */
  const rank = (adherent: Adherent): [number, number] => {
    const kept = onPage.indexOf(adherent.id)

    if (kept !== -1) return [0, kept]

    const known = listed.indexOf(keyOf(adherent))

    return known !== -1 ? [1, known] : [2, 0]
  }

  const ordered = [...conseil].sort((a, b) => {
    const [tierA, withinA] = rank(a)
    const [tierB, withinB] = rank(b)

    return tierA - tierB || withinA - withinB || nameOf(a).localeCompare(nameOf(b), 'fr')
  })

  console.log(`${ordered.length} adhérent(s) on the conseil in ${target}\n`)

  for (const adherent of ordered) {
    const shown = adherent.publicationConsent?.photo && adherent.photo

    console.log(
      `  ${nameOf(adherent).padEnd(26)} ${(adherent.boardRole ?? '').padEnd(22)} ` +
        `${shown ? 'portrait' : 'initiales'}`,
    )
  }

  const asInitials = ordered.filter(
    (adherent) => !(adherent.publicationConsent?.photo && adherent.photo),
  ).length

  if (asInitials > 0) {
    console.warn(
      `\n${asInitials} card(s) will show initials rather than a face: no portrait on the fiche, ` +
        `or no « Portrait » under « Publication sur le site ».`,
    )
  }

  if (dryRun) {
    console.log(
      `\nDry run, nothing written. Would ${existing[0] ? 'update' : 'create'} the page at ` +
        `/${PAGE.slug} with those ${ordered.length} profile(s), in that order.`,
    )
    return
  }

  /**
   * `disableRevalidate` because the pages' `afterChange` hook calls
   * `revalidatePath`, which needs a Next request to be inside of and throws
   * `Invariant: static generation store missing` out here — as the other import
   * scripts already found. Which leaves a running deployment serving the page
   * and menu it had cached, and here that costs nothing: the deployment that
   * deletes `src/app/(frontend)/board` is what makes this page reachable at all,
   * and it rebuilds both.
   */
  const context = { disableRevalidate: true }

  const document = {
    _status: 'published' as const,
    hero: { type: 'lowImpact' as const, richText: heroRichText },
    layout: [{ blockType: 'profileCards' as const, members: ordered.map(({ id }) => id) }],
    meta: { description: PAGE.description, title: PAGE.title },
    publishedAt: new Date().toISOString(),
    slug: PAGE.slug,
    title: PAGE.title,
  }

  if (existing[0]) {
    await payload.update({
      collection: 'pages',
      context,
      data: document,
      depth: 0,
      id: existing[0].id,
      overrideAccess: true,
    })
    console.log(`\nUpdated the page at /${PAGE.slug} (${ordered.length} profiles)`)
  } else {
    await payload.create({
      collection: 'pages',
      context,
      data: document,
      depth: 0,
      overrideAccess: true,
    })
    console.log(`\nCreated the page at /${PAGE.slug} (${ordered.length} profiles)`)
  }

  console.log(
    `\nNot visible yet: src/app/(frontend)/board still answers /${PAGE.slug}, and shadows the\n` +
      `admin's live preview with it. Delete that directory and its entry in STATIC_ROUTES to\n` +
      `swap it in; the preview deployment of that pull request reads this same database, so it\n` +
      `shows the real page first.`,
  )
}

await main()
process.exit(0)
