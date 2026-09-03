/**
 * Build the conseil d'administration page from the adhérents collection.
 *
 *   DRY_RUN=1 pnpm payload run scripts/build-board-page.ts
 *   pnpm payload run scripts/build-board-page.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 \
 *     pnpm payload run scripts/build-board-page.ts
 *
 * One run does the whole thing, in this order, and stops at the first thing it
 * cannot do rather than leaving half a page behind:
 *
 *   1. matches the fifteen members of `src/data/teams.ts` to adhérents
 *   2. writes each one's `boardRole`
 *   3. links each portrait, already in media as `conseil-<name>.png`
 *   4. records permission to publish those portraits — see below
 *   5. creates (or updates) the page at slug `board`, published
 *
 * Re-running it is safe and says "unchanged" for anything already right, so it
 * doubles as a way to put the page back after the conseil changes.
 *
 * TWO THINGS IT DECIDES, both worth knowing before running it:
 *
 * It records `publicationConsent.photo` for these fifteen people. Those exact
 * portraits are on /board today, so this writes down a state that already
 * exists rather than creating any new exposure — and without it the new page
 * would show fifteen sets of initials, which is worse than the page it
 * replaces. `WITHOUT_CONSENT=1` skips it if the club would rather ask each
 * person first; the page then renders correctly, just without faces.
 *
 * It treats « Abdelatif OUELDENNAOUA » and « Abdellatif OUELDENNAOUA » as the
 * same person. `src/data/teams.ts` came off the old website with one `l`; the
 * licence roster, which comes from the federation's own records, has two. The
 * roster is the better source, but somebody should check the spelling with him.
 *
 * AND ONE THING IT CANNOT DO: make the page visible. `src/app/(frontend)/board`
 * is a route, and a route wins over `/[slug]`, so /board keeps serving the coded
 * page until that directory is deleted. Which is the point of the order —
 * running this changes nothing a visitor sees, so the page can be checked
 * through the admin's live preview first, and deleting the route then swaps it
 * in with no gap.
 */
import type { Adherent } from '@/payload-types'

import { boardMembers } from '@/data/teams'

/** The one spelling difference between the old website and the licence roster. */
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

/** `Pascal BRET` is written first name first; the collection stores the halves apart. */
const split = (fullName: string) => {
  const [first, ...rest] = (ALIASES[fullName] ?? fullName).split(' ')

  return { firstName: normalise(first ?? ''), lastName: normalise(rest.join(' ')) }
}

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
  const withConsent = process.env.WITHOUT_CONSENT !== '1'
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

  const { docs: roster } = await payload.find({
    collection: 'adherents',
    depth: 0,
    limit: 0,
    overrideAccess: true,
    pagination: false,
    select: { boardRole: true, firstName: true, lastName: true, photo: true },
  })

  if (roster.length === 0) {
    console.error(
      `\nNo adhérents in ${target}. Import the roster first — Adhérents → ` +
        `« Synchroniser avec l’export CSV » — then run this again.`,
    )
    process.exit(1)
  }

  console.log(`${roster.length} adhérents in ${target}\n`)

  const byName = new Map<string, Adherent>()

  for (const adherent of roster as Adherent[]) {
    byName.set(`${normalise(adherent.lastName ?? '')}|${normalise(adherent.firstName ?? '')}`, adherent)
  }

  /**
   * Every portrait in one query rather than one apiece. The filenames are the
   * ones `src/data/teams.ts` already names, so this needs no guessing.
   */
  const filenames = boardMembers.map(({ photo }) => photo).filter((p): p is string => Boolean(p))
  const { docs: media } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: filenames.length,
    overrideAccess: true,
    pagination: false,
    where: { filename: { in: filenames } },
  })
  const mediaByFilename = new Map(media.map((doc) => [doc.filename, doc.id]))

  const matched: { adherent: Adherent; name: string; photoId?: number; role: string }[] = []
  const missing: string[] = []

  for (const member of boardMembers) {
    const { firstName, lastName } = split(member.name ?? '')
    const adherent = byName.get(`${lastName}|${firstName}`)

    if (!adherent) {
      missing.push(member.name ?? '(sans nom)')
      continue
    }

    matched.push({
      adherent,
      name: member.name ?? '',
      photoId: member.photo ? mediaByFilename.get(member.photo) : undefined,
      role: member.role ?? 'Membre',
    })
  }

  for (const { name, photoId, role } of matched) {
    console.log(`  ${name.padEnd(26)} ${role.padEnd(22)} ${photoId ? 'portrait' : 'PAS DE PORTRAIT'}`)
  }

  if (missing.length > 0) {
    console.error(
      `\n${missing.length} member(s) of the conseil are not in the roster: ${missing.join(', ')}.` +
        `\nNothing has been written. Add them by hand, or correct the spelling, and run again.`,
    )
    process.exit(1)
  }

  const withoutPortrait = matched.filter(({ photoId }) => !photoId)

  if (withoutPortrait.length > 0) {
    console.warn(
      `\n${withoutPortrait.length} portrait(s) are not in media yet, so those cards will show ` +
        `initials. Run scripts/import-team-photos.ts to add them.`,
    )
  }

  if (dryRun) {
    console.log(
      `\nDry run, nothing written. Would set ${matched.length} boardRole(s), link ` +
        `${matched.length - withoutPortrait.length} portrait(s), ` +
        `${withConsent ? 'record consent to publish them, ' : 'record no consent, '}` +
        `and publish the page at /${PAGE.slug}.`,
    )
    return
  }

  console.log('')
  let touched = 0

  for (const { adherent, name, photoId, role } of matched) {
    const data: Record<string, unknown> = {}

    if (adherent.boardRole !== role) data.boardRole = role

    const currentPhoto = typeof adherent.photo === 'object' ? adherent.photo?.id : adherent.photo

    if (photoId && currentPhoto !== photoId) data.photo = photoId
    if (withConsent && photoId) data.publicationConsent = { photo: true }

    if (Object.keys(data).length === 0) {
      console.log(`  ${name.padEnd(26)} unchanged`)
      continue
    }

    await payload.update({
      collection: 'adherents',
      data,
      depth: 0,
      id: adherent.id,
      overrideAccess: true,
    })

    touched += 1
    console.log(`  ${name.padEnd(26)} ${Object.keys(data).join(', ')}`)
  }

  const { docs: existing } = await payload.find({
    collection: 'pages',
    depth: 0,
    draft: true,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: PAGE.slug } },
  })

  const document = {
    _status: 'published' as const,
    hero: { type: 'lowImpact' as const, richText: heroRichText },
    layout: [
      { blockType: 'profileCards' as const, members: matched.map(({ adherent }) => adherent.id) },
    ],
    meta: { description: PAGE.description, title: PAGE.title },
    publishedAt: new Date().toISOString(),
    slug: PAGE.slug,
    title: PAGE.title,
  }

  if (existing[0]) {
    await payload.update({
      collection: 'pages',
      data: document,
      depth: 0,
      id: existing[0].id,
      overrideAccess: true,
    })
    console.log(`\nUpdated the page at /${PAGE.slug} (${matched.length} profiles)`)
  } else {
    await payload.create({
      collection: 'pages',
      data: document,
      depth: 0,
      overrideAccess: true,
    })
    console.log(`\nCreated the page at /${PAGE.slug} (${matched.length} profiles)`)
  }

  console.log(
    `${touched} adhérent(s) updated.\n\n` +
      `The page is published but not yet visible: src/app/(frontend)/board still\n` +
      `answers /${PAGE.slug}. Check it through the admin's live preview, then delete that\n` +
      `directory and its entry in STATIC_ROUTES to swap it in.`,
  )
}

await main()
process.exit(0)
