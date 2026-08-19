/**
 * Mirror the Vercel Blob store into the local upload directory, so a dev run
 * with disk storage serves exactly what production serves — originals and every
 * generated size variant.
 *
 *   pnpm payload run scripts/sync-media-from-blob.ts
 *
 * Reads only: it lists the store and downloads, never uploads or deletes. Files
 * already present with a matching size are skipped, so reruns are cheap.
 */
import fs from 'fs/promises'
import path from 'path'

const MEDIA_DIR = path.resolve(process.cwd(), 'public/media')
const LIST_ENDPOINT = 'https://blob.vercel-storage.com'
const CONCURRENCY = 8

type BlobEntry = { pathname: string; size: number; url: string }

const listBlobs = async (token: string) => {
  const entries: BlobEntry[] = []
  let cursor: string | undefined

  do {
    const url = new URL(LIST_ENDPOINT)
    url.searchParams.set('limit', '1000')
    if (cursor) url.searchParams.set('cursor', cursor)

    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })

    if (!res.ok) throw new Error(`Failed to list the blob store, status: ${res.status}`)

    const body = (await res.json()) as { blobs: BlobEntry[]; cursor?: string; hasMore?: boolean }

    entries.push(...body.blobs)
    cursor = body.hasMore ? body.cursor : undefined
  } while (cursor)

  return entries
}

const download = async (entry: BlobEntry) => {
  const destination = path.join(MEDIA_DIR, entry.pathname)
  const existing = await fs.stat(destination).catch(() => null)

  if (existing?.size === entry.size) return 'skipped' as const

  const res = await fetch(entry.url)

  if (!res.ok) throw new Error(`Failed to download ${entry.pathname}, status: ${res.status}`)

  await fs.mkdir(path.dirname(destination), { recursive: true })
  await fs.writeFile(destination, Buffer.from(await res.arrayBuffer()))

  return 'downloaded' as const
}

const main = async () => {
  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN is not set')

  const entries = await listBlobs(token)
  const bytes = entries.reduce((total, entry) => total + entry.size, 0)

  console.log(
    `Found ${entries.length} objects (${(bytes / 1024 / 1024).toFixed(1)} MB) in the blob store`,
  )
  console.log(`Mirroring into ${MEDIA_DIR}`)

  const counts = { downloaded: 0, skipped: 0 }

  for (let index = 0; index < entries.length; index += CONCURRENCY) {
    const batch = entries.slice(index, index + CONCURRENCY)
    const results = await Promise.all(batch.map(download))

    results.forEach((result) => counts[result]++)
  }

  console.log(`\nDone: ${counts.downloaded} downloaded, ${counts.skipped} already local.`)
}

await main()

process.exit(0)
