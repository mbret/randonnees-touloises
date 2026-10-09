import type {
  CollectionBeforeChangeHook,
  CollectionBeforeOperationHook,
  ImageSize,
  PayloadRequest,
} from 'payload'

import sharp from 'sharp'

/**
 * The files the media collection stores, held to the weight of the one that
 * was uploaded.
 *
 * Two things broke that, both on uploads that were compressed before they
 * arrived — a WebP from an online converter, typically, which the club reaches
 * for because the files made from their photos looked heavy:
 *
 * - Payload re-encodes every WebP, AVIF and GIF original, since those formats
 *   can be animated, at sharp's default quality of 80. A WebP squeezed harder
 *   than that comes out bigger: the home page's hero went in at 244 KB and was
 *   stored at 439 KB.
 * - The web sizes are encoded at quality 75 whatever they are cut from, so from
 *   a file squeezed harder than that the widest outweigh the upload they were
 *   cut from — 463 KB for that hero's 1920 size.
 *
 * Neither is a setting away. Quality 75 is not the upload's quality left
 * alone: it is a gentler compression than the converter's, which is why the
 * result is heavier, and a file does not record the quality it was saved at,
 * so there is none for Payload to carry over. What can be known is the
 * upload's weight, and that is what every file is held to:
 *
 * - the original is put back as it was sent wherever Payload's re-encode of it
 *   came out heavier and is otherwise the same picture;
 * - a size scaled from the whole picture is made again from it, at the highest
 *   quality that weighs no more than the upload — for that hero's 1920 size,
 *   which has nearly as many pixels as the upload, about the quality the
 *   converter used;
 * - a crop (`og`, `square`) is re-encoded from Payload's own cut, when it is a
 *   WebP, and no further than quality 30: a crop can hold more pixels than a
 *   small upload — both enlarge one — and then outweighs it honestly.
 *
 * Left untreated: a crop of a JPEG or PNG upload. `og` and `square` keep the
 * format they were uploaded in and the hook only encodes WebP, so from a JPEG
 * squeezed hard, or a picture smaller than the crop, they can come out heavier
 * than the upload and are stored as Payload made them. No visitor downloads
 * either — `og` is fetched by social sites when a page is shared, `square` by
 * nothing — so what it costs is a heavier file in the admin and the bucket,
 * and none of the library's JPEG or PNG uploads has one.
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
 * How far a crop is re-encoded at most. Below it a picture loses more than its
 * weight is worth.
 */
const CROP_FLOOR = 30

/** The quality a size is configured at, or sharp's own default for WebP. */
const configuredQuality = (config: ImageSize | undefined): number =>
  (config?.formatOptions?.options as undefined | { quality?: number })?.quality ?? 80

/**
 * The best `encode` can do within `limit`: the highest quality between `floor`
 * and `ceiling` whose result weighs no more, found by halving the range — about
 * seven encodes rather than one per step. Should none fit, the smallest result
 * made is kept.
 */
const fitUnder = async (
  encode: (quality: number) => Promise<Buffer>,
  limit: number,
  floor: number,
  ceiling: number,
): Promise<Buffer> => {
  let fitting: Buffer | undefined
  let smallest: Buffer | undefined
  let low = Math.min(floor, ceiling)
  let high = ceiling

  while (low <= high) {
    const quality = Math.floor((low + high) / 2)
    const candidate = await encode(quality)

    if (!smallest || candidate.length < smallest.length) smallest = candidate

    if (candidate.length <= limit) {
      fitting = candidate
      low = quality + 1
    } else {
      high = quality - 1
    }
  }

  return (fitting ?? smallest)!
}

/**
 * A size scaled from the whole picture, made again from that picture at the
 * dimensions Payload gave it. From the picture rather than from Payload's cut,
 * which is a compression of it already: squeezing the cut spends bytes on the
 * artefacts of its first compression, and the hero's 1920 size still weighed
 * 281 KB at quality 30 that way.
 *
 * `animated` keeps every frame of an animated WebP; sharp resizes each one.
 */
const redo = (picture: Buffer, width: number, height: number, limit: number, ceiling: number) =>
  fitUnder(
    (quality) =>
      sharp(picture, { animated: true })
        .rotate()
        .resize(width, height, { fastShrinkOnLoad: false, fit: 'fill' })
        .webp({ quality })
        .toBuffer(),
    limit,
    1,
    ceiling,
  )

/**
 * A crop re-encoded from Payload's own cut, so that whatever focal point it was
 * cut around is kept exactly.
 */
const squeeze = (cut: Buffer, limit: number, ceiling: number) =>
  fitUnder(
    (quality) => sharp(cut, { animated: true }).webp({ quality }).toBuffer(),
    limit,
    CROP_FLOOR,
    ceiling,
  )

/**
 * Whether the stored original is the upload re-encoded and nothing more — same
 * format, same dimensions, no orientation for sharp to have turned. When it is,
 * the upload can stand in for it, and is the picture Payload cut the sizes
 * from. A crop made in the admin changes what the original is: it is left as
 * Payload made it, and is what the sizes were cut from instead.
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
 * bring any size heavier than the upload down to its weight.
 *
 * Runs before the storage plugin's own hooks, which are appended after the
 * collection's: what it leaves on `req.file` and `req.payloadUploadSizes` is
 * what is sent to the bucket, and the sizes it writes are what the admin shows.
 */
export const neverBiggerThanUpload: CollectionBeforeChangeHook = async ({
  collection,
  data,
  req,
}) => {
  const upload = req.context[UPLOAD] as Upload | undefined

  /* Read once: a later operation on the same request — the storage plugin
   * saves its metadata with one — must not find it again. */
  delete req.context[UPLOAD]

  if (!upload || !req.file) return data

  const limit = upload.data.length

  /* Asked only once a heavier file has turned up, which a PDF — something
   * sharp cannot read — never produces. */
  let whole: Promise<boolean> | undefined
  const isWhole = () => (whole ??= isOnlyReencoded(upload, data.mimeType, data.width, data.height))

  if (req.file.data.length > limit && (await isWhole())) {
    req.file = { ...req.file, data: upload.data, size: limit }
    data.filesize = limit
  }

  for (const [name, cut] of Object.entries(req.payloadUploadSizes ?? {})) {
    const size = data.sizes?.[name]

    /* TODO: a crop of a JPEG or PNG upload is skipped here however heavy it
     * came out — see "Left untreated" above. Treating it means `squeeze`
     * encoding in the crop's own format: mozjpeg for a JPEG, a palette for a
     * PNG. */
    if (!size || cut.length <= limit || size.mimeType !== 'image/webp') continue

    const config = collection.upload.imageSizes?.find((imageSize) => imageSize.name === name)
    const ceiling = configuredQuality(config)

    /* Bounded on one side only, a size is the whole picture scaled; bounded on
     * both, it may be a crop of it. */
    const scaled = config && !(config.width && config.height) && size.width && size.height

    const fitted = scaled
      ? await redo(
          (await isWhole()) ? upload.data : req.file.data,
          size.width,
          size.height,
          limit,
          ceiling,
        )
      : await squeeze(cut, limit, ceiling)

    req.payloadUploadSizes![name] = fitted
    size.filesize = fitted.length
  }

  return data
}
