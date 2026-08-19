/**
 * Import the trombinoscope portraits from the previous randonnees-touloises.net
 * site into Payload media.
 *
 *   DRY_RUN=1 pnpm payload run scripts/import-trombinoscope.ts
 *   pnpm payload run scripts/import-trombinoscope.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 USE_REMOTE_STORAGE=1 \
 *     pnpm payload run scripts/import-trombinoscope.ts
 *
 * The gallery page itself renders only its first 50 items (data-limit="50"), so
 * the list comes from the old site's sitemap instead — one entry per portrait,
 * with the numbering the site itself uses for repeated first names
 * (`veronique-2`). Each entry's page carries the full-size image and the caption.
 *
 * Configured through the environment, not flags: the payload CLI does not
 * forward extra argv to a script. DRY_RUN=1 reports without writing, LIMIT=N
 * takes the first N portraits, PRUNE=1 additionally deletes trombinoscope media
 * that the sitemap no longer lists, and a remote database needs ALLOW_REMOTE_DB=1
 * — plus USE_REMOTE_STORAGE=1, or the files would land on this machine's disk
 * while the production rows expect them in the bucket.
 *
 * Reruns are safe: media are matched on filename and skipped, and object keys are
 * the filenames, so a re-upload overwrites rather than duplicating.
 */
const SITEMAP_URL = 'https://www.randonnees-touloises.net/sitemap.xml'
const ITEM_PATH = '/trombinoscope/'
const FILENAME_PREFIX = 'trombinoscope-'
const CONCURRENCY = 6
// The old site is served by a builder that 403s requests without a browser UA.
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

type Portrait = { extension: string; filename: string; name: string; url: string }

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const fetchText = async (url: string) => {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })

  if (!res.ok) throw new Error(`Failed to fetch ${url}, status: ${res.status}`)

  return res.text()
}

const locations = (xml: string) =>
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

/** Walk the sitemap index and keep every trombinoscope entry it points at. */
const listItemUrls = async () => {
  const index = await fetchText(SITEMAP_URL)
  const urls = new Set<string>()

  for (const location of locations(index)) {
    if (location.includes(ITEM_PATH)) {
      urls.add(location)
      continue
    }

    if (!location.endsWith('.xml')) continue

    const child = await fetchText(location).catch(() => '')

    locations(child)
      .filter((entry) => entry.includes(ITEM_PATH))
      .forEach((entry) => urls.add(entry))
  }

  return [...urls]
}

const parseItem = (html: string, itemUrl: string): Portrait | null => {
  // og:title reads "Yves - Galerie image 122 de 192 - Association ..."
  const name = html
    .match(/og:title" content="([^"]*)"/)?.[1]
    ?.split(' - Galerie image')[0]
    ?.trim()
  const url = html.match(/https:\/\/[^"']*2000_[^"']+\.(?:jpg|jpeg|png|webp)/)?.[0]

  if (!name || !url) return null

  const slug = slugify(decodeURIComponent(itemUrl.split(ITEM_PATH)[1] ?? ''))
  const extension = url.split('.').pop()?.toLowerCase() ?? 'jpg'
  // The source asset id keeps every filename unique and stable across runs.
  // A trailing `-2`-style name would not: Payload's filename uniqueness check
  // increments past sibling names, so `bernard-1` becomes `bernard-8` as soon as
  // `bernard-7` exists, and the next run then no longer recognises its own work.
  const sourceId = url.match(/\/[^/]*?([0-9a-f]{8,})\.[a-z]+$/i)?.[1] ?? slug

  return {
    extension,
    filename: `${FILENAME_PREFIX}${slug}-${sourceId}.${extension}`,
    name,
    url,
  }
}

const fetchPortrait = async ({ extension, filename, url }: Portrait) => {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })

  if (!res.ok) throw new Error(`Failed to fetch ${url}, status: ${res.status}`)

  const data = await res.arrayBuffer()

  return {
    data: Buffer.from(data),
    mimetype: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
    name: filename,
    size: data.byteLength,
  }
}

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

/**
 * Payload's getSafeFileName checks the local upload directory as well as the
 * database, so a file sitting in public/media makes it store `name-1.jpg` even
 * when the target is a remote bucket and another database entirely. Every name
 * would then drift from what src/data refers to, silently.
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
  const prune = process.env.PRUNE === '1'
  const limit = process.env.LIMIT ? Number(process.env.LIMIT) : undefined

  const itemUrls = (await listItemUrls()).slice(0, limit)

  console.log(`Sitemap lists ${itemUrls.length} portraits, reading each item page...`)

  const portraits: Portrait[] = []
  const usedFilenames = new Set<string>()

  for (let index = 0; index < itemUrls.length; index += CONCURRENCY) {
    const batch = itemUrls.slice(index, index + CONCURRENCY)
    const parsed = await Promise.all(
      batch.map(async (itemUrl) => parseItem(await fetchText(itemUrl), itemUrl)),
    )

    parsed.forEach((portrait, offset) => {
      if (!portrait) {
        console.warn(`  no image found on ${batch[offset]}`)
        return
      }

      if (usedFilenames.has(portrait.filename)) {
        console.warn(`  duplicate source for ${portrait.filename}, skipping`)
        return
      }

      usedFilenames.add(portrait.filename)
      portraits.push(portrait)
    })
  }

  console.log(`Parsed ${portraits.length} portraits`)

  if (dryRun) {
    portraits.forEach(({ filename, name }) => console.log(`  ${name} -> ${filename}`))
    console.log('\nDry run, nothing written.')
    return
  }

  const target = describeTarget()

  if (!isLocal(target) && !process.env.ALLOW_REMOTE_DB) {
    console.error(
      `\nRefusing to write to ${target}: set ALLOW_REMOTE_DB=1 to import into a non-local database.`,
    )
    process.exit(1)
  }

  if (process.env.USE_REMOTE_STORAGE === '1') {
    await assertLocalMediaCannotShadow(portraits.map(({ filename }) => filename))
  }

  const { getPayload } = await import('payload')
  const config = (await import('@payload-config')).default
  const payload = await getPayload({ config })

  console.log(`\nWriting media rows to ${target}`)

  let created = 0
  let skipped = 0
  // Ids, not filenames: Payload renames a file whose name it considers taken
  // (appending `-1`), so the name it stored is not necessarily the one asked
  // for. Pruning by requested name would delete the rows this run just wrote.
  const keptIds = new Set<number | string>()

  for (const portrait of portraits) {
    const existing = await payload.find({
      collection: 'media',
      limit: 1,
      pagination: false,
      where: { filename: { equals: portrait.filename } },
    })

    if (existing.docs[0]) {
      keptIds.add(existing.docs[0].id)
      skipped++
      continue
    }

    const doc = await payload.create({
      collection: 'media',
      data: { alt: portrait.name },
      file: await fetchPortrait(portrait),
    })

    keptIds.add(doc.id)
    created++
  }

  console.log(`${created} created, ${skipped} already present.`)

  // Everything else under the prefix is from an earlier run whose naming scheme
  // differs — the same people imported twice over.
  const { docs: imported } = await payload.find({
    collection: 'media',
    depth: 0,
    pagination: false,
    where: { filename: { like: FILENAME_PREFIX } },
  })
  const stale = imported.filter((doc) => !keptIds.has(doc.id))

  if (stale.length === 0) {
    console.log('No stale portraits.')
    return
  }

  console.log(`\n${stale.length} portraits not listed by the sitemap:`)
  stale.forEach((doc) => console.log(`  ${doc.filename}`))

  if (!prune) {
    console.log('Set PRUNE=1 to delete them.')
    return
  }

  // Pruning keeps only what this run accounted for, so an incomplete run would
  // read like the site had dropped the portraits it never reached. LIMIT makes
  // every run incomplete by definition, hence its own refusal.
  if (limit) {
    console.error('Refusing to prune a LIMIT-ed run.')
    process.exit(1)
  }

  if (portraits.length !== itemUrls.length || keptIds.size !== portraits.length) {
    console.error(
      `Refusing to prune: parsed ${portraits.length} of ${itemUrls.length} sitemap entries, ` +
        `kept ${keptIds.size}.`,
    )
    process.exit(1)
  }

  for (const doc of stale) {
    await payload.delete({ collection: 'media', id: doc.id })
    console.log(`  deleted ${doc.filename}`)
  }
}

export {}

await main()

// The database pool keeps the event loop alive once Payload has connected.
process.exit(0)
