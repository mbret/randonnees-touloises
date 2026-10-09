import type {
  CollectionBeforeChangeHook,
  CollectionBeforeOperationHook,
  PayloadRequest,
} from 'payload'

import sharp from 'sharp'

/**
 * No file the media collection stores comes out heavier than the one that was
 * uploaded.
 *
 * Two things broke that, both on uploads that were compressed before they
 * arrived — a WebP from an online converter, typically, which the club reaches
 * for because the files made from their photos looked heavy:
 *
 * - Payload re-encodes every WebP, AVIF and GIF original, since those formats
 *   can be animated, at sharp's default quality of 80. A WebP squeezed harder
 *   than that comes out bigger: the home page's hero went in at 244 KB and was
 *   stored at 449 KB.
 * - The ladder is encoded at quality 75 whatever it is cut from, so from a file
 *   squeezed below that the widest rungs outweigh the upload they came from —
 *   463 KB for that hero's 1920 rung.
 *
 * JPEG and PNG uploads hit neither in practice: their originals are stored as
 * sent, and across the library's 389 of them no rung came out heavier than its
 * original. The rule is written for every upload all the same.
 */

type Upload = NonNullable<PayloadRequest['file']>

/** Where `noteUpload` leaves the file as it arrived, for `neverBiggerThanUpload`. */
const UPLOAD = 'mediaUpload'

/**
 * Keep hold of the upload as it arrived.
 *
 * Payload swaps `req.file` for its own re-encode while it processes the upload,
 * which happens after this hook and before `beforeChange` — so this is the last
 * moment the bytes that were sent are on the request.
 */
export const noteUpload: CollectionBeforeOperationHook = ({ req }) => {
  if (req.file?.data?.length) req.context[UPLOAD] = req.file
}

/**
 * The qualities a rung is re-encoded at when it comes out heavier than the
 * upload, tried in turn until one fits. The last is as far as a picture is
 * worth squeezing; a rung that still does not fit keeps the smallest result.
 */
const SQUEEZE_QUALITIES = [60, 50, 40, 30]

/**
 * A rung re-encoded harder, from the rung itself rather than from the upload,
 * so that whatever crop or focal point Payload cut it with is kept exactly.
 * `animated` keeps every frame of an animated WebP rather than the first.
 */
const squeeze = async (rung: Buffer, limit: number): Promise<Buffer> => {
  let smallest = rung

  for (const quality of SQUEEZE_QUALITIES) {
    const candidate = await sharp(rung, { animated: true }).webp({ quality }).toBuffer()

    if (candidate.length < smallest.length) smallest = candidate
    if (smallest.length <= limit) break
  }

  return smallest
}

/**
 * Whether the stored original is the upload re-encoded and nothing more — same
 * format, same dimensions, no orientation for sharp to have turned — and so can
 * be the upload itself. A crop made in the admin changes what the original is,
 * and is left as Payload made it.
 */
const isOnlyReencoded = async (
  upload: Upload,
  mimeType: unknown,
  width: unknown,
  height: unknown,
) => {
  if (upload.mimetype !== mimeType) return false

  const metadata = await sharp(upload.data).metadata()

  return (
    (!metadata.orientation || metadata.orientation === 1) &&
    metadata.width === width &&
    (metadata.pageHeight ?? metadata.height) === height
  )
}

/**
 * Put the upload back where Payload's re-encode of it came out heavier, and
 * squeeze any rung heavier than the upload until it is not.
 *
 * Runs before the storage plugin's own hooks, which are appended after the
 * collection's: what it leaves on `req.file` and `req.payloadUploadSizes` is
 * what is sent to the bucket, and the sizes it writes are what the admin shows.
 */
export const neverBiggerThanUpload: CollectionBeforeChangeHook = async ({ data, req }) => {
  const upload = req.context[UPLOAD] as Upload | undefined

  /* Read once: a later operation on the same request — the storage plugin
   * saves its metadata with one — must not find it again. */
  delete req.context[UPLOAD]

  if (!upload || !req.file) return data

  const limit = upload.data.length

  if (
    req.file.data.length > limit &&
    (await isOnlyReencoded(upload, data.mimeType, data.width, data.height))
  ) {
    req.file = { ...req.file, data: upload.data, size: limit }
    data.filesize = limit
  }

  for (const [name, rung] of Object.entries(req.payloadUploadSizes ?? {})) {
    const size = data.sizes?.[name]

    if (!size || rung.length <= limit || size.mimeType !== 'image/webp') continue

    const squeezed = await squeeze(rung, limit)

    req.payloadUploadSizes![name] = squeezed
    size.filesize = squeezed.length
  }

  return data
}
