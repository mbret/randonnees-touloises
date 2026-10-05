/**
 * Put the photos of a folder named after the people they show — « Prénom
 * Nom.jpg » — onto those people's fiches.
 *
 *   FOLDER=~/Downloads/Trombinoscope DRY_RUN=1 pnpm payload run scripts/import-portrait-folder.ts
 *   FOLDER=~/Downloads/Trombinoscope CONSENTED=1 pnpm payload run scripts/import-portrait-folder.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 USE_REMOTE_STORAGE=1 \
 *     FOLDER=~/Downloads/Trombinoscope CONSENTED=1 \
 *     pnpm payload run scripts/import-portrait-folder.ts
 *
 * Written for the « Trombinoscope » folder the club keeps on Google Drive: the
 * photos the old trombinoscope was made of, each still named with the full
 * name the old site cut down to a first name. Download it (Drive's Download on
 * the folder gives a zip), unzip it, and point FOLDER at the result.
 *
 * A photo goes on the one fiche carrying its file's exact name, and only while
 * that fiche has no photo — `planFolder` holds the rule. A trailing number only
 * tells two files apart, « Lucien Bernier 1.jpg », and is not part of the name.
 *
 * The name stays on this machine. The media library is public, so the upload
 * is named `portrait-<first name>-<hash>` and captioned with the first name,
 * as the old trombinoscope's are, and a photo whose name no fiche carries is
 * not uploaded at all.
 *
 * Read the dry run first. It lists the files whose name no fiche carries, most
 * of them a spelling the folder and the federation do not share (« Brigite
 * Vasseur » for Brigitte VASSEUR): rename those to the name on the fiche and run it again.
 *
 * CONSENTED=1 also ticks « Portrait » under « Publication sur le site » on each
 * fiche given a photo, in the same write. Set it only when everyone in the
 * folder has agreed to be on the site, as everyone in the Drive folder has.
 * Without it the boxes stay as they are.
 *
 * Run this before `attach-adherent-portraits.ts`, which fills what it can of
 * the rest, and redeploy afterwards to show the faces. Reruns are safe: a fiche
 * with a photo is left alone, and the upload's name comes from the file's
 * bytes, so one whose fiche was never written is found again, not repeated.
 */
import type { Dirent } from 'fs'

import { planFolder } from '@/collections/Adherents/portraits'

const FILENAME_PREFIX = 'portrait-'

const MIME_TYPES: Record<string, string> = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

type Photo = { extension: string; file: string; mimetype: string; name: string }

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

/** « Lucien Bernier 1.jpg » is a photo of « Lucien Bernier ». */
const toPhoto = (file: string): null | Photo => {
  const match = file.normalize('NFC').match(/^(.+)\.([^.]+)$/)
  const extension = match?.[2].toLowerCase() ?? ''
  const mimetype = MIME_TYPES[extension]

  if (!match || !mimetype) return null

  return {
    extension,
    file,
    mimetype,
    name: match[1].replace(/\s*(?:\(\d+\)|\d+)$/, '').trim(),
  }
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

const row = (name: string, file: string) => `  ${name.padEnd(30)} ${file}`

/**
 * Payload's getSafeFileName checks the local upload directory as well as the
 * database, so a file sitting in public/media makes it store `name-1.jpg` even
 * when the target is a remote bucket and another database entirely. A rerun
 * finds an upload by its name, so it would no longer find that one.
 */
const assertLocalMediaCannotShadow = async (filenames: string[]) => {
  const { access } = await import('fs/promises')
  const path = await import('path')
  const staticDir = path.resolve(process.cwd(), 'public/media')
  const shadowing: string[] = []

  for (const filename of filenames) {
    const exists = await access(path.join(staticDir, filename)).then(
      () => true,
      () => false,
    )

    if (exists) shadowing.push(filename)
  }

  if (shadowing.length === 0) return

  console.error(
    `\n${shadowing.length} of these files also exist in public/media, which would make ` +
      `Payload rename every upload (${shadowing[0]} -> a "-1" variant).\n` +
      `Move public/media aside for the duration of a remote import, then move it back.`,
  )
  process.exit(1)
}

const main = async () => {
  const dryRun = process.env.DRY_RUN === '1'
  const consented = process.env.CONSENTED === '1'
  const { createHash } = await import('crypto')
  const { readdir, readFile } = await import('fs/promises')
  const { homedir } = await import('os')
  const path = await import('path')

  if (!process.env.FOLDER) {
    console.error(
      'Set FOLDER to the folder of portraits, for example FOLDER=~/Downloads/Trombinoscope.',
    )
    process.exit(1)
  }

  const folder = path.resolve(process.env.FOLDER.replace(/^~(?=\/|$)/, homedir()))
  const entries: Dirent[] = await readdir(folder, { withFileTypes: true }).catch(() => {
    console.error(`Cannot read the folder ${folder}.`)
    process.exit(1)
  })

  const files = entries
    .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
    .map(({ name }) => name)
  const photos = files.map(toPhoto).filter((photo): photo is Photo => photo !== null)
  const byFile = new Map(photos.map((photo) => [photo.file, photo]))
  const skipped = files.filter((file) => !byFile.has(file))

  const target = describeTarget()
  const remote = !isLocal(target)

  if (!dryRun && remote && !process.env.ALLOW_REMOTE_DB) {
    console.error(
      `\nRefusing to write to ${target}: set ALLOW_REMOTE_DB=1 to import into a non-local database.`,
    )
    process.exit(1)
  }

  /* Without the bucket the files would land on this machine's disk, and the
   * rows written next to them would point every page at photos that are not
   * there. */
  if (!dryRun && remote && process.env.USE_REMOTE_STORAGE !== '1') {
    console.error(
      `\nRefusing to write to ${target} without USE_REMOTE_STORAGE=1: the photos would be ` +
        `stored on this machine while the rows expect them in the bucket.`,
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

  const plan = planFolder({ adherents, photos })

  /* Named from the bytes, so the same file always makes the same upload. */
  const uploads = await Promise.all(
    plan.attach.map(async (attachment) => {
      const photo = byFile.get(attachment.file)!
      const data = await readFile(path.join(folder, photo.file))
      const hash = createHash('sha256').update(data).digest('hex').slice(0, 12)
      const first = slugify(attachment.firstName) || 'adherent'

      return {
        ...attachment,
        data,
        filename: `${FILENAME_PREFIX}${first}-${hash}.${photo.extension}`,
        mimetype: photo.mimetype,
      }
    }),
  )

  const { docs: existing } =
    uploads.length > 0
      ? await payload.find({
          collection: 'media',
          depth: 0,
          limit: 0,
          overrideAccess: true,
          pagination: false,
          select: { filename: true },
          where: { filename: { in: uploads.map(({ filename }) => filename) } },
        })
      : { docs: [] }
  const inLibrary = new Map(existing.map(({ filename, id }) => [filename, id]))

  console.log(`${photos.length} photos in ${folder}, ${adherents.length} fiches in ${target}.`)

  if (skipped.length > 0) {
    console.log(`\nNot a photo this imports (${skipped.length}): ${skipped.join(', ')}`)
  }

  if (uploads.length > 0) {
    console.log(
      `\nFor a fiche with no photo (${uploads.length}), ` +
        (consented ? '« Portrait » ticked with it:' : '« Portrait » left as it is:'),
    )
    uploads.forEach(({ file, name }) => console.log(row(name, file)))
  }

  if (plan.alreadyShown > 0) {
    console.log(`\nAlready on the site with a photo, left as they are: ${plan.alreadyShown}.`)
  }

  if (plan.photographed.length > 0) {
    console.log(
      `\nThe fiche already has a photo, without « Portrait »: look at it, then tick the box ` +
        `by hand (${plan.photographed.length}):\n  ${plan.photographed.join(', ')}`,
    )
  }

  if (plan.unmatched.length > 0) {
    console.log(
      `\nNo fiche carries the name of these files, so nothing is uploaded for them ` +
        `(${plan.unmatched.length}). Rename each to the name on the fiche, or leave it if ` +
        `that person has left:\n  ${plan.unmatched.join(', ')}`,
    )
  }

  if (plan.homonyms.length > 0) {
    console.log(
      `\nSeveral fiches carry these names, so nothing is done for them ` +
        `(${plan.homonyms.length}): ${plan.homonyms.join(', ')}`,
    )
  }

  if (!consented) {
    console.log(
      '\nSet CONSENTED=1 to tick « Portrait » as well, if everyone in the folder agreed to be ' +
        'on the site.',
    )
  }

  if (dryRun) {
    console.log('\nDry run, nothing written.')
    return
  }

  if (process.env.USE_REMOTE_STORAGE === '1') {
    await assertLocalMediaCannotShadow(
      uploads.map(({ filename }) => filename).filter((filename) => !inLibrary.has(filename)),
    )
  }

  let attached = 0
  let failed = 0

  for (const upload of uploads) {
    try {
      const media =
        inLibrary.get(upload.filename) ??
        (
          await payload.create({
            collection: 'media',
            data: { alt: upload.firstName },
            file: {
              data: upload.data,
              mimetype: upload.mimetype,
              name: upload.filename,
              size: upload.data.byteLength,
            },
            overrideAccess: true,
          })
        ).id

      await payload.update({
        collection: 'adherents',
        /* `disableRevalidate` because `revalidateAdherentPages` calls
         * `revalidatePath`, which throws outside a Next request. The deploy
         * after the attach script is what renders the pages. */
        context: { disableRevalidate: true },
        data: consented
          ? { photo: media, publicationConsent: upload.publicationConsent }
          : { photo: media },
        depth: 0,
        id: upload.adherent,
        overrideAccess: true,
      })

      attached++
    } catch (error) {
      failed++
      console.error(
        `  FAILED ${upload.name} ← ${upload.file}: ${error instanceof Error ? error.message : error}`,
      )
    }
  }

  console.log(`\nDone: ${attached} fiche(s) given a photo, ${failed} failed.`)
  console.log(
    '\nNext: DRY_RUN=1 pnpm payload run scripts/attach-adherent-portraits.ts, with the same ' +
      'POSTGRES_URL, then redeploy.',
  )

  if (failed > 0) process.exit(1)
}

export {}

await main()

// The database pool keeps the event loop alive once Payload has connected.
process.exit(0)
