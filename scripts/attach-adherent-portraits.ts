/**
 * Put the portraits already in the media library onto the adhérents' fiches.
 *
 *   DRY_RUN=1 pnpm payload run scripts/attach-adherent-portraits.ts
 *   pnpm payload run scripts/attach-adherent-portraits.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 DRY_RUN=1 \
 *     pnpm payload run scripts/attach-adherent-portraits.ts
 *
 * The trombinoscope and the profile cards read a portrait off each person's
 * fiche, and most fiches have none, while the portraits imported from the old
 * site sit in the library under the name of whoever they show. This fills in
 * `photo` wherever that name settles whose face it is — the rule is in
 * `planPortraits` — and lists the rest for someone to finish in the admin.
 *
 * Run `import-portrait-folder.ts` first. The old site's trombinoscope kept
 * only first names, while the club's folder of its photos has the full ones,
 * and that script puts them on the fiches itself, so most need no guess here.
 *
 * It writes `photo` and nothing else. « Portrait » under « Publication sur le
 * site » stays as it is, so a fiche given a photograph shows it nowhere until
 * someone ticks that box. A fiche where it is already ticked shows its portrait
 * at the next render, so it only takes a match on the full name, and the
 * report marks it.
 *
 * Read the dry run before writing. A match on a first name alone is the only
 * portrait and the only fiche carrying that name, which makes it very probably
 * right and not certainly: the portraits go back to 2018, and the face may be
 * a namesake who has since left. Those matches are listed apart; look at the
 * face before ticking « Portrait » on one of them.
 *
 * A rerun only fills fiches that are still empty, so it is safe, and it also
 * puts back a wrong match that someone cleared by hand, as long as the names
 * still point at that fiche. Read the dry run of a rerun as well.
 *
 * No files move, only the reference to one, so USE_REMOTE_STORAGE is not
 * needed.
 */
import type { PortraitAttachment } from '@/collections/Adherents/portraits'

import { planPortraits } from '@/collections/Adherents/portraits'

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

const row = (name: string, filename: string) => `  ${name.padEnd(30)} ${filename}`

const section = (title: string, attachments: PortraitAttachment[]) => {
  if (attachments.length === 0) return

  console.log(`\n${title} (${attachments.length}):`)
  attachments.forEach(({ consented, filename, name }) =>
    console.log(
      `${row(name, filename)}${consented ? '  (« Portrait » ticked: goes on the site)' : ''}`,
    ),
  )
}

const main = async () => {
  const dryRun = process.env.DRY_RUN === '1'
  const target = describeTarget()

  if (!dryRun && !isLocal(target) && !process.env.ALLOW_REMOTE_DB) {
    console.error(
      `\nRefusing to write to ${target}: set ALLOW_REMOTE_DB=1 to attach portraits in a ` +
        `non-local database.`,
    )
    process.exit(1)
  }

  const { getPayload } = await import('payload')
  const config = (await import('@payload-config')).default
  const payload = await getPayload({ config })

  const { docs: adherents } = await payload.find({
    collection: 'adherents',
    depth: 0,
    limit: 0,
    overrideAccess: true,
    pagination: false,
    select: { firstName: true, lastName: true, photo: true, publicationConsent: true },
  })

  const { docs: uploads } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 0,
    overrideAccess: true,
    pagination: false,
    select: { alt: true, filename: true },
  })

  const plan = planPortraits({ adherents, uploads })
  const byFullName = plan.attach.filter(({ matchedOn }) => matchedOn === 'fullName')
  const byFirstName = plan.attach.filter(({ matchedOn }) => matchedOn === 'firstName')

  console.log(
    `${adherents.length} fiches in ${target}, ${plan.alreadyPortrayed} with a portrait ` +
      `already; ${uploads.length} uploads in the library.`,
  )

  section('By full name', byFullName)
  section(
    'By first name, the only portrait and the only fiche to carry it — look at the face ' +
      'before ticking « Portrait »',
    byFirstName,
  )

  if (plan.shared.length > 0) {
    console.log(
      `\nShared names (${plan.shared.length}): on each fiche listed, « Portrait » → choose ` +
        `from the library, and search the name without its accents to see every candidate.`,
    )

    for (const { adherents: without, fiches, name, portraits } of plan.shared) {
      console.log(
        `  ${name}: ${portraits.length} portrait(s), ${fiches} fiche(s) — ` +
          `${without.length} without one: ${without.join(', ')}`,
      )
    }
  }

  if (plan.toConfirm.length > 0) {
    console.log(
      `\nNot written, « Portrait » is already ticked and this is a match on the first name ` +
        `only (${plan.toConfirm.length}):`,
    )
    plan.toConfirm.forEach(({ filename, name }) => console.log(row(name, filename)))
  }

  if (plan.unmatched.length > 0) {
    console.log(
      `\nOn a portrait, but on no fiche — a nickname, another spelling, or someone who has ` +
        `left (${plan.unmatched.length}):\n  ${plan.unmatched.join(', ')}`,
    )
  }

  console.log(
    `\n${plan.attach.length} portrait(s) to attach. Afterwards ` +
      `${adherents.length - plan.stillWithout} of ${adherents.length} fiches have one.`,
  )

  if (dryRun) {
    console.log('\nDry run, nothing written.')
    return
  }

  let attached = 0
  let failed = 0

  for (const { adherent, filename, media, name } of plan.attach) {
    try {
      await payload.update({
        collection: 'adherents',
        /**
         * `disableRevalidate` because `revalidateAdherentPages` calls
         * `revalidatePath`, which needs a Next request to be inside of and
         * throws `Invariant: static generation store missing` out here — as
         * every other script in this directory found. Nothing a visitor sees
         * waits on it but the fiches already consented, which the end of the
         * run counts.
         */
        context: { disableRevalidate: true },
        data: { photo: media },
        depth: 0,
        id: adherent,
        overrideAccess: true,
      })

      attached++
    } catch (error) {
      failed++
      console.error(
        `  FAILED ${name} ← ${filename}: ${error instanceof Error ? error.message : error}`,
      )
    }
  }

  console.log(`\nDone: ${attached} attached, ${failed} failed.`)

  const shownNow = plan.attach.filter(({ consented }) => consented).length

  if (shownNow > 0) {
    console.log(
      `\n${shownNow} of them already had « Portrait » ticked, so their portrait is on the\n` +
        `site once the pages showing adhérents are rendered again: redeploy, or save those\n` +
        `pages in the admin.`,
    )
  }

  if (failed > 0) process.exit(1)
}

await main()

// The database pool keeps the event loop alive once Payload has connected.
process.exit(0)
