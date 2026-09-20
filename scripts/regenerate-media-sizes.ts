/**
 * Rebuild the generated sizes of uploads that predate the WebP ladder.
 *
 *   DRY_RUN=1 pnpm payload run scripts/regenerate-media-sizes.ts
 *   LIMIT=3 pnpm payload run scripts/regenerate-media-sizes.ts
 *   POSTGRES_URL=<production url> ALLOW_REMOTE_DB=1 USE_REMOTE_STORAGE=1 \
 *     pnpm payload run scripts/regenerate-media-sizes.ts
 *
 * `imageSizes` decides what sharp makes at upload, so changing it reaches only
 * what is uploaded afterwards. The 249 documents already in the collection keep
 * whatever they were given when they arrived, which for all of them is a JPEG
 * or PNG ladder — and `ImageMedia` offers a rung only when it exists, so until
 * this has run those documents render their original and nothing else. Correct,
 * and the whole point of the change is undone for them.
 *
 * Payload regenerates the sizes when a document is updated with a file, so the
 * work here is to hand each one back the bytes it already has. Those come over
 * HTTP from `SOURCE_ORIGIN` rather than out of the bucket, so the script needs
 * no storage credentials of its own and reads exactly what a visitor would.
 *
 * USE_REMOTE_STORAGE=1 matters for a production run: without it the config
 * leaves the remote adapter out and the regenerated sizes would be written to
 * this machine's disk while the production rows expect them in the bucket.
 *
 * Reruns are cheap — a document whose ladder is already WebP is skipped — so
 * LIMIT is the way in: run it against three documents, look at them in the
 * admin and on the site, then run it against the rest. That is not a formality;
 * the first three run before `overwriteExistingFiles` was set came back renamed.
 *
 * Check the filenames after a LIMIT run, not just that it reported success. A
 * document that comes back under a new name has left every URL that pointed at
 * the old one answering 404.
 *
 * REDEPLOY AFTERWARDS. Replacing a document's file replaces the files its old
 * rungs pointed at, and a rendered page cached before that still carries the
 * old URLs in its `srcset`. A `<source>` is committed to once its `type`
 * matches, so a browser that picks a rung which has since 404ed does not fall
 * back to the `<img>` beneath it — the image is simply broken until the page is
 * rendered again. `revalidateMedia` covers the site assets, which are cached by
 * tag; nothing reaches a cached page, so the render cache has to go.
 */
import config from '@payload-config'

const SOURCE_ORIGIN =
  process.env.SOURCE_ORIGIN ??
  process.env.NEXT_PUBLIC_SERVER_URL ??
  'https://www.randonnees-touloises.net'

const DRY_RUN = process.env.DRY_RUN === '1'
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : undefined

/** The sizes that make the ladder, as `src/collections/Media.ts` defines it. */
const LADDER = ['thumbnail', 'small', 'medium', 'large', 'xlarge'] as const

/** The narrowest rung, so an upload below it can never have one. */
const NARROWEST_RUNG = 300

type MediaDoc = {
  id: number | string
  filename?: null | string
  mimeType?: null | string
  sizes?: null | Record<string, { mimeType?: null | string } | null | undefined>
  url?: null | string
  width?: null | number
}

/**
 * Whether this document has already been through the ladder.
 *
 * A rung reporting `image/webp` is the mark of it. An upload narrower than the
 * narrowest rung has none and never will — Payload omits a size wider than the
 * original rather than upscaling into it — so it counts as done rather than
 * being re-fetched on every run, as does anything sharp does not rasterise.
 */
const alreadyDone = (doc: MediaDoc) => {
  if (!doc.mimeType?.startsWith('image/')) return true
  if (doc.mimeType === 'image/svg+xml') return true
  if (typeof doc.width === 'number' && doc.width < NARROWEST_RUNG) return true

  return LADDER.some((name) => doc.sizes?.[name]?.mimeType === 'image/webp')
}

const fetchOriginal = async (doc: MediaDoc) => {
  const url = new URL(doc.url!, SOURCE_ORIGIN).toString()
  const res = await fetch(url)

  if (!res.ok) throw new Error(`${res.status} fetching ${url}`)

  const data = Buffer.from(await res.arrayBuffer())

  return {
    data,
    mimetype: doc.mimeType!,
    name: doc.filename!,
    size: data.byteLength,
  }
}

const main = async () => {
  const { getPayload } = await import('payload')

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 0,
    pagination: false,
  })

  const pending = (docs as MediaDoc[]).filter((doc) => !alreadyDone(doc) && doc.url && doc.filename)
  const todo = LIMIT ? pending.slice(0, LIMIT) : pending

  console.log(`media documents      : ${docs.length}`)
  console.log(`already on the ladder: ${docs.length - pending.length}`)
  console.log(`to regenerate        : ${todo.length}${LIMIT ? ` (LIMIT=${LIMIT})` : ''}`)
  console.log(`reading originals from: ${SOURCE_ORIGIN}`)

  if (DRY_RUN) {
    todo.forEach((doc) => console.log(`  would regenerate ${doc.filename}`))
    console.log('\nDRY_RUN=1, nothing written.')

    return
  }

  let done = 0
  let failed = 0

  /* One at a time on purpose: each one is a fetch, five sharp resizes and five
   * writes to the bucket, and there is no deadline here worth the risk of
   * running that concurrently against production. */
  for (const doc of todo) {
    try {
      await payload.update({
        collection: 'media',
        id: doc.id,
        data: {},
        file: await fetchOriginal(doc),
        /* Without this Payload treats the document's own file as a name
         * collision and picks the next free one instead, so a regeneration
         * renames what it was meant to rebuild. It does not stop at one: the
         * first three run this way turned `pot-1.jpg` into `pot-2.jpg`, and
         * then `pot.jpg` into the `pot-1.jpg` that had just been vacated — a
         * cascade between documents, with every old URL 404 behind it.
         * `generateFileData` skips `getSafeFileName` when this is set, which is
         * the whole of the difference. */
        overwriteExistingFiles: true,
      })

      done++
      console.log(`  regenerated ${doc.filename}`)
    } catch (error) {
      failed++
      console.error(`  FAILED ${doc.filename}: ${error instanceof Error ? error.message : error}`)
    }
  }

  console.log(`\nDone: ${done} regenerated, ${failed} failed.`)

  if (done > 0) {
    console.log(
      '\nRedeploy now: pages cached before this run still carry the rung URLs\n' +
        'these documents had, and those files are gone.',
    )
  }
}

export {}

/* Payload holds the Postgres pool open, so the process outlives `main` unless
 * it is told not to — as the other scripts here are. */
try {
  await main()
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
