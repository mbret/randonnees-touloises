import { describe, expect, it } from 'vitest'
import sharp from 'sharp'

import { neverBiggerThanUpload, noteUpload } from '@/hooks/neverBiggerThanUpload'

const WIDTH = 640
const HEIGHT = 360

type Sent = { data: Buffer; mimetype: string; name: string; size: number }

/**
 * A photograph's worth of detail — a gradient under noise, which no encoder
 * gets for free. Seeded, so that every run compresses the same.
 */
const photo = () => {
  const pixels = Buffer.alloc(WIDTH * HEIGHT * 3)
  let seed = 7

  for (let i = 0; i < pixels.length; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    pixels[i] = Math.min(255, ((Math.floor(i / 3) % WIDTH) / WIDTH) * 200 + (seed % 56))
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
const squeezedWebp = async () => sent(await photo().webp({ quality: 40 }).toBuffer(), 'image/webp')

/** A photograph straight off a phone. */
const cameraJpeg = async () => sent(await photo().jpeg({ quality: 95 }).toBuffer(), 'image/jpeg')

/**
 * The two hooks around what Payload does between them: the original re-encoded
 * at sharp's defaults when it is a WebP, kept as sent otherwise, unless the
 * admin cropped it — and the ladder cut from the upload at quality 75.
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
  const xlarge = await sharp(upload.data).webp({ quality: 75 }).toBuffer()
  const thumbnail = await sharp(upload.data).resize({ width: 160 }).webp({ quality: 75 }).toBuffer()

  req.file = { ...upload, data: original, size: original.length }
  req.payloadUploadSizes = { thumbnail, xlarge }

  const data = {
    filesize: original.length,
    height: HEIGHT,
    mimeType: upload.mimetype,
    sizes: {
      thumbnail: { filesize: thumbnail.length, mimeType: 'image/webp', width: 160 },
      xlarge: { filesize: xlarge.length, mimeType: 'image/webp', width: WIDTH },
    },
    width: cropTo ?? WIDTH,
  }

  const returned = await (neverBiggerThanUpload as any)({ data, operation: 'create', req })

  return { data, original, req, returned, thumbnail, xlarge }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('an upload that was compressed before it arrived', () => {
  /* The premise, checked rather than assumed: without the hook, both of these
   * would be stored heavier than the file that was sent. */
  it('is one Payload would store heavier than it was sent', async () => {
    const upload = await squeezedWebp()
    const { original, xlarge } = await save(upload)

    expect(original.length).toBeGreaterThan(upload.size)
    expect(xlarge.length).toBeGreaterThan(upload.size)
  })

  it('is stored as it was sent rather than as a heavier re-encode of itself', async () => {
    const upload = await squeezedWebp()
    const { data, req } = await save(upload)

    expect(req.file.data.equals(upload.data)).toBe(true)
    expect(req.file.size).toBe(upload.size)
    expect(data.filesize).toBe(upload.size)
  })

  it('has every rung that came out heavier squeezed until it is not', async () => {
    const upload = await squeezedWebp()
    const { data, req } = await save(upload)
    const rung = req.payloadUploadSizes.xlarge

    expect(rung.length).toBeLessThanOrEqual(upload.size)
    expect(data.sizes.xlarge.filesize).toBe(rung.length)

    /* Still the rung it was: the same format, at the same width. */
    const { format, width } = await sharp(rung).metadata()

    expect(format).toBe('webp')
    expect(width).toBe(WIDTH)
  })

  it('leaves a rung that was already lighter exactly as it was', async () => {
    const { req, thumbnail } = await save(await squeezedWebp())

    expect(req.payloadUploadSizes.thumbnail).toBe(thumbnail)
  })

  /* A crop made in the admin changes what the original is, so the upload
   * cannot stand in for it. */
  it('keeps a cropped original as Payload made it', async () => {
    const { original, req } = await save(await squeezedWebp(), { cropTo: 600 })

    expect(req.file.data).toBe(original)
  })
})

describe('a photograph uploaded as it came', () => {
  /* What nearly all of the library is, and what never needed this. */
  it('is stored and cut exactly as Payload made it', async () => {
    const upload = await cameraJpeg()
    const { data, req, thumbnail, xlarge } = await save(upload)

    expect(req.file.data).toBe(upload.data)
    expect(data.filesize).toBe(upload.size)
    expect(req.payloadUploadSizes.xlarge).toBe(xlarge)
    expect(req.payloadUploadSizes.thumbnail).toBe(thumbnail)
  })
})

describe('a save without a file', () => {
  /* An edited alt text, a moved focal point: nothing was uploaded. */
  it('changes nothing', async () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const req: any = { context: {} }
    const data = { alt: 'Sur le sentier', filesize: 1234 }

    await (noteUpload as any)({ args: {}, operation: 'update', req })
    const returned = await (neverBiggerThanUpload as any)({ data, operation: 'update', req })
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
