/**
 * Import the conseil d'administration and équipe d'animation portraits from the
 * previous randonnees-touloises.net site into Payload media.
 *
 *   DRY_RUN=1 pnpm payload run scripts/import-team-photos.ts
 *   pnpm payload run scripts/import-team-photos.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 USE_REMOTE_STORAGE=1 \
 *     pnpm payload run scripts/import-team-photos.ts
 *
 * Unlike the trombinoscope, these pages caption every portrait with the member's
 * full name, so the file can be keyed on it — `conseil-pascal-bret.png` — and
 * src/data/teams.ts refers to that filename. The pages then resolve it by
 * filename rather than by id, because local and production ids are independent
 * sequences.
 *
 * USE_REMOTE_STORAGE=1 matters for a production run: without it the config leaves
 * the remote adapter out and the files would be written to this machine's disk
 * while the production rows expect them in the bucket.
 */
const SOURCE_PAGES = [
  { prefix: 'conseil', url: 'https://www.randonnees-touloises.net/conseil-d-administration' },
  { prefix: 'animation', url: 'https://www.randonnees-touloises.net/%C3%A9quipe-d-animation' },
]
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

const decodeEntities = (value: string) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')

const fetchPage = async (url: string) => {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })

  if (!res.ok) throw new Error(`Failed to fetch ${url}, status: ${res.status}`)

  return res.text()
}

/** The builder serves 400_/800_/normal_ variants of every upload. */
const largestVariant = async (url: string) => {
  for (const prefix of ['normal', '800']) {
    const candidate = url.replace(/\/(400|800|normal)_/, `/${prefix}_`)
    const res = await fetch(candidate, { headers: { 'User-Agent': USER_AGENT }, method: 'HEAD' })

    if (res.ok) return candidate
  }

  return url
}

const parsePortraits = async (html: string, prefix: string) => {
  const portraits: Portrait[] = []

  for (const block of html.split('team-member-wrap').slice(1)) {
    const name = block.match(/class="member-name"[^>]*><strong>(.*?)<\/strong>/s)?.[1]
    const image = block.match(/background-image: url\((https:\/\/[^)]+)\)/)?.[1]

    if (!name || !image) continue

    const fullName = decodeEntities(name.replace(/<[^>]+>/g, ''))
      .replace(/\s+/g, ' ')
      .trim()
    const url = await largestVariant(image)
    const extension = url.split('.').pop()?.toLowerCase() ?? 'jpg'

    portraits.push({
      extension,
      filename: `${prefix}-${slugify(fullName)}.${extension}`,
      name: fullName,
      url,
    })
  }

  return portraits
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

const main = async () => {
  const dryRun = process.env.DRY_RUN === '1'
  const portraits: Portrait[] = []

  for (const page of SOURCE_PAGES) {
    const parsed = await parsePortraits(await fetchPage(page.url), page.prefix)

    console.log(`${page.prefix}: ${parsed.length} portraits`)
    parsed.forEach(({ filename, name }) => console.log(`  ${name} -> ${filename}`))
    portraits.push(...parsed)
  }

  if (dryRun) {
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

  const { getPayload } = await import('payload')
  const config = (await import('@payload-config')).default
  const payload = await getPayload({ config })

  console.log(`\nWriting media rows to ${target}`)

  let created = 0
  let skipped = 0

  for (const portrait of portraits) {
    const existing = await payload.find({
      collection: 'media',
      limit: 1,
      pagination: false,
      where: { filename: { equals: portrait.filename } },
    })

    if (existing.docs.length > 0) {
      skipped++
      continue
    }

    await payload.create({
      collection: 'media',
      data: { alt: portrait.name },
      file: await fetchPortrait(portrait),
    })

    created++
    console.log(`  created ${portrait.filename}`)
  }

  console.log(`\nDone: ${created} created, ${skipped} already present.`)
}

export {}

await main()

process.exit(0)
