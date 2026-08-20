/**
 * Seed the `posts` collection with the programme as published on the previous
 * randonnees-touloises.net site.
 *
 *   DRY_RUN=1 pnpm payload run scripts/import-programme.ts
 *   pnpm payload run scripts/import-programme.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 USE_REMOTE_STORAGE=1 \
 *     pnpm payload run scripts/import-programme.ts
 *
 * The source is scripts/data/programme.ts. Each entry becomes a published post
 * with a `schedule.startDate`, which is what puts it in the programme rather
 * than in the actualités. The séjours also carry a PDF: it is fetched from the
 * old site and uploaded to media, and the `file:` link target in the body is
 * rewritten to point at it. Those PDFs are password-protected at rest, so the
 * club's "contact the responsable for the code" arrangement survives the move
 * untouched.
 *
 * Configured through the environment, not flags: the payload CLI does not
 * forward extra argv to a script. DRY_RUN=1 reports without writing, LIMIT=N
 * takes the first N entries, and a remote database needs ALLOW_REMOTE_DB=1.
 *
 * Reruns are safe, and are how a correction to the data reaches the CMS: a post
 * is matched on its slug and updated in place, so re-importing after fixing a
 * transcription leaves no duplicate behind. An uploaded PDF is reused rather
 * than fetched again. SKIP_EXISTING=1 leaves what is already there alone, for
 * topping up without overwriting anything an editor has since reworked.
 */
import { postPath } from '@/utilities/postPath'

import { summarise } from '@/collections/Posts/hooks/fillMeta'

import { programEntries, type SeedProgramEntry, type SeedProgramFile } from './data/programs'

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

/** `[texte](cible)`, inline in any line. */
const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g

/** `![texte alternatif](cible)` alone on its line, which becomes a media block. */
const imagePattern = /^!\[([^\]]*)\]\(([^)]+)\)$/

/** What Payload needs to store the upload; the club's files are PNGs and PDFs. */
const mimetypes: Record<string, string> = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  pdf: 'application/pdf',
  png: 'image/png',
  webp: 'image/webp',
}

const mimetypeFor = (filename: string) => {
  const mimetype = mimetypes[filename.split('.').pop()?.toLowerCase() ?? '']

  if (!mimetype) throw new Error(`No mimetype known for ${filename}`)

  return mimetype
}

/** A lexical text node, with the flags the editor expects on every one. */
const textNode = (text: string) => ({
  type: 'text' as const,
  detail: 0,
  format: 0,
  mode: 'normal' as const,
  style: '',
  text,
  version: 1,
})

const linkNode = (text: string, url: string) => ({
  type: 'link' as const,
  children: [textNode(text)],
  direction: 'ltr' as const,
  fields: { linkType: 'custom' as const, newTab: true, url },
  format: '' as const,
  indent: 0,
  version: 3,
})

/**
 * One line of the body. `String.split` on a pattern with two groups hands back
 * [texte, libellé, cible, texte, …], so every third part is plain text and the
 * two that follow it are a link.
 */
/**
 * An image on its own line, as the `mediaBlock` the post editor uses for
 * pictures — the same block an editor would insert by hand, so the club can move
 * or replace it afterwards.
 */
const mediaBlockNode = (media: number, id: string) => ({
  type: 'block' as const,
  fields: { id, blockName: '', blockType: 'mediaBlock' as const, media },
  format: '' as const,
  version: 2,
})

const paragraphNode = (line: string, resolve: (target: string) => string) => {
  const parts = line.split(linkPattern)
  const children: (ReturnType<typeof textNode> | ReturnType<typeof linkNode>)[] = []

  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 0) {
      if (parts[i]) children.push(textNode(parts[i]))
      continue
    }

    children.push(linkNode(parts[i], resolve(parts[i + 1])))
    i++
  }

  return {
    type: 'paragraph' as const,
    children,
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    textFormat: 0,
    version: 1,
  }
}

const toRichText = (
  content: string,
  resolve: (target: string) => string,
  resolveMedia: (target: string) => number,
  key: string,
) => ({
  root: {
    type: 'root' as const,
    children: content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const image = imagePattern.exec(line)

        return image
          ? mediaBlockNode(resolveMedia(image[2]), `${key}-${index}`)
          : paragraphNode(line, resolve)
      }),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const describeTarget = () => {
  try {
    const { host, pathname } = new URL(process.env.POSTGRES_URL ?? '')

    return `${host}${pathname}`
  } catch {
    return 'unknown (POSTGRES_URL is not set)'
  }
}

const isLocal = (target: string) =>
  /^(localhost|127\.0\.0\.1|host\.docker\.internal)[:/]/.test(target)

const main = async () => {
  const dryRun = process.env.DRY_RUN === '1'
  const skipExisting = process.env.SKIP_EXISTING === '1'
  const limit = Number(process.env.LIMIT) || 0
  const entries: SeedProgramEntry[] = limit ? programEntries.slice(0, limit) : programEntries
  const target = describeTarget()

  if (!dryRun && !isLocal(target) && !process.env.ALLOW_REMOTE_DB) {
    console.error(
      `Refusing to write to ${target}: set ALLOW_REMOTE_DB=1 to import into a non-local database.`,
    )
    process.exit(1)
  }

  const { default: config } = await import('@payload-config')
  const { getPayload } = await import('payload')
  const payload = await getPayload({ config })

  /** Every file the bodies need, uploaded on first sight and reused after. */
  const uploaded = new Map<string, { id: number; url: string }>()

  const upload = async (file: SeedProgramFile) => {
    const seen = uploaded.get(file.filename)

    if (seen) return seen

    const { docs } = await payload.find({
      collection: 'media',
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { filename: { equals: file.filename } },
    })

    if (docs[0]?.url) {
      const found = { id: docs[0].id, url: docs[0].url }

      uploaded.set(file.filename, found)
      console.log(`  reused ${file.filename}`)

      return found
    }

    const res = await fetch(file.url, { headers: { 'User-Agent': USER_AGENT } })

    if (!res.ok) throw new Error(`Failed to fetch ${file.url}, status: ${res.status}`)

    const data = Buffer.from(await res.arrayBuffer())
    const doc = await payload.create({
      collection: 'media',
      data: { alt: file.label },
      file: {
        data,
        mimetype: mimetypeFor(file.filename),
        name: file.filename,
        size: data.byteLength,
      },
    })

    if (!doc.url) throw new Error(`Uploaded ${file.filename} but Payload returned no url`)

    const created = { id: doc.id, url: doc.url }

    uploaded.set(file.filename, created)
    console.log(`  uploaded ${file.filename} (${Math.round(data.byteLength / 1024)} KB)`)

    return created
  }

  let created = 0
  let updated = 0
  let skipped = 0

  for (const entry of entries) {
    const { slug } = entry
    const label = `${entry.startDate} ${entry.title}`
    // Where the entry will be readable, which its date decides.
    const url = postPath({ schedule: { startDate: entry.startDate }, slug })

    const { docs: existing } = await payload.find({
      collection: 'posts',
      depth: 0,
      draft: true,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      select: { slug: true },
      where: { slug: { equals: slug } },
    })

    const current = existing[0]

    if (current && skipExisting) {
      skipped++
      console.log(`  skipped ${label} (already present)`)
      continue
    }

    if (dryRun) {
      if (current) updated++
      else created++

      console.log(`  would ${current ? 'update' : 'create'} ${label} -> ${url}`)
      entry.files?.forEach((file) => console.log(`    would upload ${file.filename}`))
      continue
    }

    /** `file:<nom>` in a body points at one of the entry's own uploads. */
    const targets = new Map<string, { id: number; url: string }>()

    for (const file of entry.files ?? []) {
      targets.set(`file:${file.filename}`, await upload(file))
    }

    const target = (value: string) => {
      const resolved = targets.get(value)

      if (!resolved) throw new Error(`${entry.title} refers to ${value}, which it does not carry`)

      return resolved
    }

    /** A link either points at one of the uploads or is a plain URL. */
    const resolve = (value: string) => (value.startsWith('file:') ? target(value).url : value)

    const resolveMedia = (value: string) => target(value).id

    const content = toRichText(entry.content, resolve, resolveMedia, slug)

    const data = {
      _status: 'published' as const,
      content,
      // Left off so the slug stays what the seed decided, whatever the generator
      // would make of the title.
      generateSlug: false,
      // The same values `fillMeta` would derive; set here so the post is
      // complete on its own rather than relying on a hook to be there.
      meta: { description: summarise(content), title: entry.title },
      schedule: {
        endDate: entry.endDate ? `${entry.endDate}T00:00:00.000Z` : undefined,
        startDate: `${entry.startDate}T00:00:00.000Z`,
      },
      slug,
      title: entry.title,
    }

    // The afterChange hook calls revalidatePath, which throws outside a Next
    // request. Nothing is serving pages from this process anyway.
    const context = { disableRevalidate: true }

    if (current) {
      await payload.update({ collection: 'posts', context, data, id: current.id })
      updated++
      console.log(`  updated ${label} -> ${url}`)
      continue
    }

    await payload.create({
      collection: 'posts',
      context,
      data: { ...data, publishedAt: new Date().toISOString() },
    })
    created++
    console.log(`  created ${label} -> ${url}`)
  }

  console.log(
    `${dryRun ? 'Would create' : 'Created'} ${created}, ` +
      `${dryRun ? 'update' : 'updated'} ${updated}, skipped ${skipped}, of ${entries.length}.`,
  )
}

export {}

await main()

// The database pool keeps the event loop alive once Payload has connected.
process.exit(0)
