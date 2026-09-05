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
 *   2. writes each one's `boardRole`, and clears it on anyone who has one but
 *      is no longer on the list
 *   3. links each portrait, already in media as `conseil-<name>.png`
 *   4. records permission to publish those portraits — see below
 *   5. creates (or updates) the page at slug `board`, published
 *
 * All of it inside one transaction, so a failure anywhere leaves the database
 * exactly as it was. Half a conseil is worse than none: some people would carry
 * a role and a portrait while others did not, and nothing on screen would say
 * which half had landed.
 *
 * Re-running it is safe and says "unchanged" for anything already right, so it
 * doubles as a way to put the page back after the conseil changes — including
 * when somebody has left it, which is why step 2 clears as well as writes.
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

  const { commitTransaction, createLocalReq, getPayload, initTransaction, killTransaction } =
    await import('payload')
  const config = (await import('@payload-config')).default
  const payload = await getPayload({ config })

  const { docs: roster } = await payload.find({
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
    byName.set(
      `${normalise(adherent.lastName ?? '')}|${normalise(adherent.firstName ?? '')}`,
      adherent,
    )
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
    console.log(
      `  ${name.padEnd(26)} ${role.padEnd(22)} ${photoId ? 'portrait' : 'PAS DE PORTRAIT'}`,
    )
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

  /**
   * Anyone the collection still says is on the conseil who is not on the list any
   * more. Without this the script only ever adds: change `src/data/teams.ts` and
   * run it again, and the person who stepped down keeps their `boardRole` — off
   * the page, because the page holds its own list of members, but reading as a
   * board member everywhere the collection is read. The role is a fact about the
   * conseil, so the rebuild owns clearing it as much as setting it.
   *
   * Only the role. The portrait and the permission to publish it stay: they were
   * given for a photograph, not for a mandate, and this is not the place to
   * withdraw them.
   */
  const kept = new Set(matched.map(({ adherent }) => adherent.id))
  const departed = (roster as Adherent[])
    .filter((adherent) => adherent.boardRole && !kept.has(adherent.id))
    .map((adherent) => ({
      adherent,
      name: `${adherent.firstName ?? ''} ${adherent.lastName ?? ''}`.trim(),
    }))

  if (departed.length > 0) {
    console.log(
      `\n${departed.length} adhérent(s) hold a role but are no longer on the list: ` +
        `${departed.map(({ adherent, name }) => `${name} (${adherent.boardRole})`).join(', ')}.` +
        `\nTheir role will be cleared; their portrait and permissions are left alone.`,
    )
  }

  if (dryRun) {
    console.log(
      `\nDry run, nothing written. Would set ${matched.length} boardRole(s), clear ` +
        `${departed.length}, link ${matched.length - withoutPortrait.length} portrait(s), ` +
        `${withConsent ? 'record consent to publish them, ' : 'record no consent, '}` +
        `and publish the page at /${PAGE.slug}.`,
    )
    return
  }

  /**
   * One transaction over the fifteen roles, the portraits, the permissions and
   * the page itself. Payload assigns it to `req.transactionID` and every write
   * below is handed the same `req`, so they land together or not at all; a throw
   * anywhere reaches `killTransaction` and the database is untouched.
   *
   * `createLocalReq` because a script has no request of its own. Building one by
   * hand, or spreading an existing one, silently breaks: a `PayloadRequest` is a
   * Web `Request`, so a spread copy keeps the own properties and drops every
   * prototype getter, `headers` included.
   *
   * `disableRevalidate` for the same reason the other import scripts set it: the
   * pages' `afterChange` hook calls `revalidatePath`, which needs a Next request
   * to be inside of and throws `Invariant: static generation store missing` out
   * here. Which leaves a running deployment serving the page and the menu it had
   * cached — and here that costs nothing, because the deployment that deletes
   * `src/app/(frontend)/board` is what makes this page reachable in the first
   * place, and it rebuilds both.
   */
  const req = await createLocalReq({ context: { disableRevalidate: true } }, payload)

  await initTransaction(req)

  console.log('')

  /** Which write was in flight, so a failure names the person rather than a row id. */
  let at = ''

  try {
    let touched = 0

    for (const { adherent, name, photoId, role } of matched) {
      const data: Record<string, unknown> = {}

      at = name

      if (adherent.boardRole !== role) data.boardRole = role

      const currentPhoto = typeof adherent.photo === 'object' ? adherent.photo?.id : adherent.photo

      if (photoId && currentPhoto !== photoId) data.photo = photoId

      /**
       * Consent is written only when it is not already recorded, and the other
       * two permissions are carried across rather than left out. A group written
       * as `{ photo: true }` is a statement about the whole group, and this
       * script knows nothing about the telephone and the e-mail — those are the
       * adhérent's own answers, given elsewhere.
       */
      if (withConsent && photoId && adherent.publicationConsent?.photo !== true) {
        data.publicationConsent = { ...adherent.publicationConsent, photo: true }
      }

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
        req,
      })

      touched += 1
      console.log(`  ${name.padEnd(26)} ${Object.keys(data).join(', ')}`)
    }

    for (const { adherent, name } of departed) {
      at = name

      await payload.update({
        collection: 'adherents',
        data: { boardRole: null },
        depth: 0,
        id: adherent.id,
        overrideAccess: true,
        req,
      })

      touched += 1
      console.log(`  ${name.padEnd(26)} boardRole effacé`)
    }

    at = `la page /${PAGE.slug}`

    const { docs: existing } = await payload.find({
      collection: 'pages',
      depth: 0,
      draft: true,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      req,
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
        req,
      })
      console.log(`\nUpdated the page at /${PAGE.slug} (${matched.length} profiles)`)
    } else {
      await payload.create({
        collection: 'pages',
        data: document,
        depth: 0,
        overrideAccess: true,
        req,
      })
      console.log(`\nCreated the page at /${PAGE.slug} (${matched.length} profiles)`)
    }

    await commitTransaction(req)

    console.log(
      `${touched} adhérent(s) updated.\n\n` +
        `The page is published but not yet visible: src/app/(frontend)/board still\n` +
        `answers /${PAGE.slug}, and shadows the admin's live preview with it. Delete that\n` +
        `directory and its entry in STATIC_ROUTES to swap it in; the preview deployment\n` +
        `of that pull request reads this same database, so it shows the real page first.`,
    )
  } catch (error) {
    await killTransaction(req)

    const because = error instanceof Error ? error.message : String(error)

    console.error(`\n${at ? `${at} : ` : ''}${because}\n\nNothing was written.`)
    process.exit(1)
  }
}

await main()
process.exit(0)
