import { describe, expect, it } from 'vitest'
import sharp from 'sharp'

import { neverBiggerThanUpload, noteUpload } from '@/hooks/neverBiggerThanUpload'

const WIDTH = 640
const HEIGHT = 360

type Sent = { data: Buffer; mimetype: string; name: string; size: number }

/**
 * A photograph's worth of detail: noise at every scale from 32-pixel blotches
 * down to single pixels, over a gradient brightening to the right. Squeezed
 * hard, the coarser of it is left as blocks that every later encode pays for,
 * as the converter left the hero; grain alone would be smoothed flat, and cost
 * nothing to encode again. Seeded, so that every run compresses the same.
 */
const photo = async () => {
  const total = new Float32Array(WIDTH * HEIGHT * 3)
  let seed = 7

  for (const scale of [32, 16, 8, 4, 2, 1]) {
    const width = Math.ceil(WIDTH / scale)
    const height = Math.ceil(HEIGHT / scale)
    const noise = Buffer.alloc(width * height * 3)

    for (let i = 0; i < noise.length; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      noise[i] = seed % 256
    }

    const layer = await sharp(noise, { raw: { channels: 3, height, width } })
      .resize(WIDTH, HEIGHT, { fit: 'fill', kernel: 'cubic' })
      .raw()
      .toBuffer()

    for (let i = 0; i < total.length; i++) total[i] += (layer[i] - 128) / scale
  }

  const pixels = Buffer.alloc(total.length)

  for (let i = 0; i < pixels.length; i++) {
    const across = (Math.floor(i / 3) % WIDTH) / WIDTH

    pixels[i] = Math.max(0, Math.min(255, 128 + total[i] / 2 + (across - 0.5) * 80))
  }

  return sharp(pixels, { raw: { channels: 3, height: HEIGHT, width: WIDTH } })
}

const sent = (data: Buffer, mimetype: string): Sent => ({
  data,
  mimetype,
  name: `upload.${mimetype.split('/')[1]}`,
  size: data.length,
})

/** A WebP compressed before it arrived, the way an online converter leaves one. */
const squeezedWebp = async (quality = 40) =>
  sent(await (await photo()).webp({ quality }).toBuffer(), 'image/webp')

/** A photograph straight off a phone. */
const cameraJpeg = async () =>
  sent(await (await photo()).jpeg({ quality: 95 }).toBuffer(), 'image/jpeg')

const webp75 = { format: 'webp', options: { quality: 75 } } as const

/**
 * The collection's sizes, in miniature: a thumbnail, the top of the ladder —
 * as wide as the upload, as `xlarge` is for one narrower than 1920 — and a
 * crop in the upload's own format, as `og` and `square` are.
 */
const IMAGE_SIZES = [
  { formatOptions: webp75, name: 'thumbnail', width: 160 },
  { formatOptions: webp75, name: 'xlarge', width: WIDTH, withoutEnlargement: true },
  { height: HEIGHT, name: 'crop', width: 480 },
]

const collection = { upload: { imageSizes: IMAGE_SIZES } }

/** How far apart two pictures of the same dimensions are, pixel by pixel. */
const difference = async (a: Buffer, b: Buffer) => {
  const [x, y] = await Promise.all([a, b].map((image) => sharp(image).greyscale().raw().toBuffer()))
  let total = 0

  for (let i = 0; i < x.length; i++) total += Math.abs(x[i] - y[i])

  return total / x.length
}

/** The whole upload squashed to `width` × `height`: what a size cut from the wrong picture would be. */
const squashed = (upload: Sent, width: number, height: number) =>
  sharp(upload.data).resize(width, height, { fit: 'fill' }).toBuffer()

/**
 * The two hooks around what Payload does between them: the original re-encoded
 * at sharp's defaults when it is a WebP, kept as sent otherwise, unless the
 * admin cropped it — and the sizes cut from the crop if there is one and from
 * the upload as sent if not.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
const save = async (upload: Sent, { cropTo }: { cropTo?: number } = {}) => {
  const req: any = { context: {}, file: upload }

  await (noteUpload as any)({ args: {}, operation: 'create', req })

  const original = cropTo
    ? await sharp(upload.data)
        .extract({ height: HEIGHT, left: 0, top: 0, width: cropTo })
        .toBuffer()
    : upload.mimetype === 'image/webp'
      ? await sharp(upload.data, { animated: true }).rotate().toBuffer()
      : upload.data
  const source = cropTo ? original : upload.data

  const cuts: Record<string, Buffer> = {}
  const sizes: Record<string, any> = {}

  for (const { formatOptions, height, name, width, withoutEnlargement } of IMAGE_SIZES as any[]) {
    let cut = sharp(source).rotate().resize(width, height, { withoutEnlargement })

    if (formatOptions) cut = cut.toFormat(formatOptions.format, formatOptions.options)

    const { data, info } = await cut.toBuffer({ resolveWithObject: true })

    cuts[name] = data
    sizes[name] = {
      filesize: data.length,
      height: info.height,
      mimeType: `image/${info.format}`,
      width: info.width,
    }
  }

  req.file = { ...upload, data: original, size: original.length }
  req.payloadUploadSizes = { ...cuts }

  const data = {
    filesize: original.length,
    height: HEIGHT,
    mimeType: upload.mimetype,
    sizes,
    width: cropTo ?? WIDTH,
  }

  const returned = await (neverBiggerThanUpload as any)({
    collection,
    data,
    operation: 'create',
    req,
  })

  return { cuts, data, original, req, returned }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('an upload that was compressed before it arrived', () => {
  /* The premise, checked rather than assumed: without the hook, both of these
   * would be stored heavier than the file that was sent. */
  it('is one Payload would store heavier than it was sent', async () => {
    const upload = await squeezedWebp()
    const { cuts, original } = await save(upload)

    expect(original.length).toBeGreaterThan(upload.size)
    expect(cuts.xlarge.length).toBeGreaterThan(upload.size)
  })

  it('is stored as it was sent rather than as a heavier re-encode of itself', async () => {
    const upload = await squeezedWebp()
    const { data, req } = await save(upload)

    expect(req.file.data.equals(upload.data)).toBe(true)
    expect(req.file.size).toBe(upload.size)
    expect(data.filesize).toBe(upload.size)
  })

  it('has every size that came out heavier made again until it is not', async () => {
    const upload = await squeezedWebp()
    const { data, req } = await save(upload)
    const size = req.payloadUploadSizes.xlarge

    expect(size.length).toBeLessThanOrEqual(upload.size)
    expect(data.sizes.xlarge.filesize).toBe(size.length)

    /* Still the size it was: the same format, at the same dimensions. */
    const { format, height, width } = await sharp(size).metadata()

    expect(format).toBe('webp')
    expect(width).toBe(WIDTH)
    expect(height).toBe(HEIGHT)
  })

  /* The home page's hero was squeezed to about quality 20, and squeezing
   * Payload's own cut of it — down to quality 30 and no further — left its 1920
   * size at 281 KB against the upload's 244. */
  it('gets no size heavier than itself however hard it was squeezed', async () => {
    const upload = await squeezedWebp(10)
    const { cuts, req } = await save(upload)
    const cutSqueezed = await sharp(cuts.xlarge).webp({ quality: 30 }).toBuffer()

    expect(cutSqueezed.length).toBeGreaterThan(upload.size)
    expect(req.payloadUploadSizes.xlarge.length).toBeLessThanOrEqual(upload.size)
  })

  /* The highest quality that fits, not the first that does: a size squeezed
   * further than its limit would be worse than it had to be. */
  it('has a size squeezed no further than it has to be', async () => {
    const upload = await squeezedWebp()
    const { req } = await save(upload)

    expect(req.payloadUploadSizes.xlarge.length).toBeGreaterThan(upload.size * 0.8)
  })

  it('leaves a size that was already lighter exactly as it was', async () => {
    const { cuts, req } = await save(await squeezedWebp())

    expect(req.payloadUploadSizes.thumbnail).toBe(cuts.thumbnail)
  })

  /* A crop made in the admin changes what the original is, so the upload
   * cannot stand in for it. */
  it('keeps a cropped original as Payload made it', async () => {
    const { original, req } = await save(await squeezedWebp(), { cropTo: 600 })

    expect(req.file.data).toBe(original)
  })

  /* Made again from the upload, a cropped picture's sizes would be the whole
   * of it squashed into the crop's dimensions. */
  it('has a cropped upload’s sizes made again from the crop', async () => {
    const upload = await squeezedWebp(10)
    const { cuts, original, req } = await save(upload, { cropTo: 600 })
    const size = req.payloadUploadSizes.xlarge

    expect(cuts.xlarge.length).toBeGreaterThan(upload.size)
    expect(size.length).toBeLessThanOrEqual(upload.size)
    expect(await difference(size, original)).toBeLessThan(
      await difference(size, await squashed(upload, 600, HEIGHT)),
    )
  })

  /* A crop is cut around a focal point the hook does not repeat, so it is
   * squeezed from Payload's cut: the same picture, in fewer bytes. */
  it('has a crop that came out heavier squeezed without being cut again', async () => {
    const upload = await squeezedWebp(20)
    const { cuts, data, req } = await save(upload)
    const size = req.payloadUploadSizes.crop

    expect(cuts.crop.length).toBeGreaterThan(upload.size)
    expect(size.length).toBeLessThanOrEqual(upload.size)
    expect(data.sizes.crop.filesize).toBe(size.length)
    expect(await difference(size, cuts.crop)).toBeLessThan(
      await difference(size, await squashed(upload, 480, HEIGHT)),
    )

    const { height, width } = await sharp(size).metadata()

    expect([width, height]).toEqual([480, HEIGHT])
  })
})

describe('a photograph uploaded as it came', () => {
  /* What nearly all of the library is, and what never needed this. */
  it('is stored and cut exactly as Payload made it', async () => {
    const upload = await cameraJpeg()
    const { cuts, data, req } = await save(upload)

    expect(req.file.data).toBe(upload.data)
    expect(data.filesize).toBe(upload.size)

    for (const name of Object.keys(cuts)) {
      expect(req.payloadUploadSizes[name]).toBe(cuts[name])
    }
  })
})

describe('a save without a file', () => {
  /* An edited alt text, a moved focal point: nothing was uploaded. */
  it('changes nothing', async () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const req: any = { context: {} }
    const data = { alt: 'Sur le sentier', filesize: 1234 }

    await (noteUpload as any)({ args: {}, operation: 'update', req })
    const returned = await (neverBiggerThanUpload as any)({
      collection,
      data,
      operation: 'update',
      req,
    })
    /* eslint-enable @typescript-eslint/no-explicit-any */

    expect(returned).toEqual({ alt: 'Sur le sentier', filesize: 1234 })
  })

  /* The storage plugin saves its metadata with a second operation on the same
   * request; it must not find the first one's upload waiting. */
  it('finds nothing left over from an upload earlier on the request', async () => {
    const { req } = await save(await squeezedWebp())

    expect(req.context).toEqual({})
  })
})

describe('a file that is not a picture', () => {
  /* The library takes PDFs too. Payload stores one as sent and cuts no sizes
   * from it — and sharp cannot read one, so nothing may ask it to. */
  it('is stored as it was sent, without being read as a picture', async () => {
    const pdf = sent(
      Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<>>\nendobj\n%%EOF\n'),
      'application/pdf',
    )
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const req: any = { context: {}, file: pdf }
    const data = { filesize: pdf.size, mimeType: 'application/pdf' }

    await (noteUpload as any)({ args: {}, operation: 'create', req })
    const returned = await (neverBiggerThanUpload as any)({
      collection,
      data,
      operation: 'create',
      req,
    })
    /* eslint-enable @typescript-eslint/no-explicit-any */

    expect(returned).toEqual({ filesize: pdf.size, mimeType: 'application/pdf' })
    expect(req.file.data).toBe(pdf.data)
  })
})
