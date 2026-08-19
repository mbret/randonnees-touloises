/**
 * Move media files between the R2 bucket and the local upload directory.
 *
 *   DIRECTION=up   pnpm payload run scripts/sync-media-r2.ts   # disk -> bucket
 *   DIRECTION=down pnpm payload run scripts/sync-media-r2.ts   # bucket -> disk
 *
 * DRY_RUN=1 reports without transferring. Files already present at the same
 * size are skipped, so reruns are cheap.
 *
 * `up` is what seeds a fresh bucket from a machine that already holds the
 * media, including the size variants Payload generated. `down` is dev setup:
 * local runs keep uploads on disk, so a new clone needs the files copied in
 * before the media it inherits from production resolves.
 *
 * Reads R2_BUCKET, R2_ENDPOINT, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY —
 * the same variables the Payload config uses.
 */
import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import fs from 'fs/promises'
import path from 'path'

const MEDIA_DIR = path.resolve(process.cwd(), 'public/media')
const CONCURRENCY = 8

const contentTypes: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

const client = () => {
  const { R2_ACCESS_KEY_ID, R2_BUCKET, R2_ENDPOINT, R2_SECRET_ACCESS_KEY } = process.env

  if (!R2_BUCKET || !R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    throw new Error('R2_BUCKET, R2_ENDPOINT, R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY must be set')
  }

  return {
    bucket: R2_BUCKET,
    s3: new S3Client({
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
      endpoint: R2_ENDPOINT,
      forcePathStyle: true,
      region: 'auto',
    }),
  }
}

const listBucket = async (s3: S3Client, bucket: string) => {
  const sizes = new Map<string, number>()
  let token: string | undefined

  do {
    const page = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: token }),
    )

    page.Contents?.forEach(({ Key, Size }) => {
      if (Key) sizes.set(Key, Size ?? 0)
    })
    token = page.NextContinuationToken
  } while (token)

  return sizes
}

const inBatches = async <T>(items: T[], run: (item: T) => Promise<'skipped' | 'synced'>) => {
  const counts = { skipped: 0, synced: 0 }

  for (let index = 0; index < items.length; index += CONCURRENCY) {
    const results = await Promise.all(items.slice(index, index + CONCURRENCY).map(run))

    results.forEach((result) => counts[result]++)
  }

  return counts
}

const main = async () => {
  const direction = process.env.DIRECTION
  const dryRun = process.env.DRY_RUN === '1'

  if (direction !== 'up' && direction !== 'down') {
    throw new Error('Set DIRECTION=up (disk -> bucket) or DIRECTION=down (bucket -> disk)')
  }

  const { bucket, s3 } = client()
  const remote = await listBucket(s3, bucket)

  if (direction === 'up') {
    const local = await fs.readdir(MEDIA_DIR).catch(() => [])
    const pending: { name: string; size: number }[] = []

    for (const name of local) {
      const stat = await fs.stat(path.join(MEDIA_DIR, name))

      if (!stat.isFile()) continue
      if (remote.get(name) === stat.size) continue

      pending.push({ name, size: stat.size })
    }

    const bytes = pending.reduce((total, { size }) => total + size, 0)

    console.log(
      `${local.length} local files, ${remote.size} already in ${bucket}; ` +
        `${pending.length} to upload (${(bytes / 1024 / 1024).toFixed(1)} MB)`,
    )

    if (dryRun) return console.log('Dry run, nothing transferred.')

    const counts = await inBatches(pending, async ({ name }) => {
      await s3.send(
        new PutObjectCommand({
          Body: await fs.readFile(path.join(MEDIA_DIR, name)),
          Bucket: bucket,
          ContentType: contentTypes[path.extname(name).toLowerCase()],
          Key: name,
        }),
      )

      return 'synced'
    })

    return console.log(`Uploaded ${counts.synced}.`)
  }

  const keys = [...remote.keys()]

  console.log(`${keys.length} objects in ${bucket}, mirroring into ${MEDIA_DIR}`)

  if (dryRun) return console.log('Dry run, nothing transferred.')

  await fs.mkdir(MEDIA_DIR, { recursive: true })

  const counts = await inBatches(keys, async (key) => {
    const destination = path.join(MEDIA_DIR, key)
    const existing = await fs.stat(destination).catch(() => null)

    if (existing?.size === remote.get(key)) return 'skipped'

    const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }))

    await fs.mkdir(path.dirname(destination), { recursive: true })
    await fs.writeFile(destination, Buffer.from(await object.Body!.transformToByteArray()))

    return 'synced'
  })

  console.log(`Downloaded ${counts.synced}, ${counts.skipped} already local.`)
}

await main()

process.exit(0)
