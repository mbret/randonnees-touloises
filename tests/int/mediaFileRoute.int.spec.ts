// @vitest-environment node

import type { GetObjectCommandInput } from '@aws-sdk/client-s3'
import { UPLOAD_CONTENT_SECURITY_POLICY } from 'payload/internal'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { publicAccess } from '@/access/publicAccess'
import { Media } from '@/collections/Media'
import { getMediaUrl } from '@/utilities/getMediaUrl'

type S3 = typeof import('@aws-sdk/client-s3')

const ROUTE = '@/app/(payload)/api/media/file/[filename]/route'

/** A stored file, or the status R2 answers for its key. */
const stored = new Map<string, { body: string; contentType: string } | number>()
const sent: { command: string; input: GetObjectCommandInput; signal: boolean }[] = []
const cancelled: string[] = []
const payloadGET = vi.fn(async () => new Response('from Payload'))

const fakeSend = async (
  s3: S3,
  command: { input: GetObjectCommandInput },
  options?: { abortSignal?: AbortSignal },
) => {
  const head = command instanceof s3.HeadObjectCommand
  const { Key = '', Range } = command.input
  sent.push({
    command: head ? 'HeadObject' : 'GetObject',
    input: command.input,
    signal: Boolean(options?.abortSignal),
  })

  const object = stored.get(Key) ?? 404
  const fail = (status: number) =>
    new s3.S3ServiceException({
      $fault: 'client',
      $metadata: { httpStatusCode: status },
      message: `R2 answered ${status}`,
      name: 'R2Error',
    })

  if (typeof object === 'number') throw fail(object)

  const range = Range?.match(/^bytes=(\d+)-(\d*)$/)
  const start = range ? Number(range[1]) : 0
  const end = range?.[2] ? Number(range[2]) : object.body.length - 1

  if (start >= object.body.length) throw fail(416)

  const body = object.body.slice(start, end + 1)

  return {
    Body: head
      ? undefined
      : {
          transformToWebStream: () =>
            new ReadableStream({
              cancel: () => void cancelled.push(Key),
              pull: (controller) => {
                controller.enqueue(new TextEncoder().encode(body))
                controller.close()
              },
            }),
        },
    ContentLength: head ? object.body.length : body.length,
    ContentRange: range && !head ? `bytes ${start}-${end}/${object.body.length}` : undefined,
    ContentType: object.contentType,
    ETag: '"revision-1"',
  }
}

vi.mock('@aws-sdk/client-s3', async (importOriginal) => {
  const s3 = await importOriginal<S3>()

  return {
    ...s3,
    S3Client: class {
      send = (command: { input: GetObjectCommandInput }, options?: { abortSignal?: AbortSignal }) =>
        fakeSend(s3, command, options)
    },
  }
})
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@payloadcms/next/routes', () => ({ REST_GET: () => payloadGET, REST_OPTIONS: vi.fn() }))

type Route = typeof import('@/app/(payload)/api/media/file/[filename]/route')

/** Imports the route afresh with these variables set, since it decides where files live as it loads. */
const loadRoute = async (env: Record<string, string>): Promise<Route> => {
  vi.resetModules()
  Object.entries(env).forEach(([name, value]) => vi.stubEnv(name, value))

  try {
    return await import(ROUTE)
  } finally {
    vi.unstubAllEnvs()
  }
}

const request = (
  route: Route,
  filename: string,
  { headers = {}, method = 'GET', revision = '' } = {},
) =>
  route[method === 'HEAD' ? 'HEAD' : 'GET'](
    new Request(`https://example.test${getMediaUrl(`/api/media/file/${filename}`, revision)}`, {
      headers,
      method,
    }),
    { params: Promise.resolve({ filename }) },
  )

const collectionCacheControl = () =>
  (Media.upload as { modifyResponseHeaders: (args: { headers: Headers }) => Headers })
    .modifyResponseHeaders({ headers: new Headers() })
    .get('Cache-Control')

afterEach(() => {
  stored.clear()
  sent.length = 0
  cancelled.length = 0
  payloadGET.mockClear()
})

describe('the media file route, with the bucket configured', () => {
  let route: Route

  beforeAll(async () => {
    route = await loadRoute({ R2_BUCKET: 'media', USE_REMOTE_STORAGE: '1' })
  })

  /** The bucket path skips Payload's access check, which is only safe while it lets everyone in. */
  it('serves a collection anyone may read', () => {
    expect(Media.access?.read).toBe(publicAccess)
  })

  it('serves a file from the bucket without starting Payload', async () => {
    stored.set('photo.webp', { body: 'bytes', contentType: 'image/webp' })

    const response = await request(route, 'photo.webp', { revision: '2026-01-01T00:00:00.000Z' })

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('bytes')
    expect(response.headers.get('Content-Type')).toBe('image/webp')
    expect(response.headers.get('Content-Length')).toBe('5')
    expect(response.headers.get('ETag')).toBe('"revision-1"')
    expect(response.headers.get('Cache-Control')).toContain('immutable')
    expect(sent).toEqual([
      {
        command: 'GetObject',
        input: { Bucket: 'media', Key: 'photo.webp', Range: undefined },
        signal: true,
      },
    ])
    expect(payloadGET).not.toHaveBeenCalled()
  })

  it('answers a URL naming no revision with the collection’s own window', async () => {
    stored.set('photo.webp', { body: 'bytes', contentType: 'image/webp' })

    const response = await request(route, 'photo.webp')

    expect(response.headers.get('Cache-Control')).toBe(collectionCacheControl())
  })

  it('keeps scripts out of an SVG, as Payload does', async () => {
    stored.set('logo.svg', { body: '<svg/>', contentType: 'image/svg+xml' })
    stored.set('photo.webp', { body: 'bytes', contentType: 'image/webp' })

    const svg = await request(route, 'logo.svg')
    const photo = await request(route, 'photo.webp')

    expect(svg.headers.get('Content-Security-Policy')).toBe(UPLOAD_CONTENT_SECURITY_POLICY)
    expect(photo.headers.get('Content-Security-Policy')).toBeNull()
  })

  it('serves the part of a file a range asks for', async () => {
    stored.set('programme.pdf', { body: 'bytes', contentType: 'application/pdf' })

    const response = await request(route, 'programme.pdf', { headers: { Range: 'bytes=0-1' } })

    expect(response.status).toBe(206)
    expect(response.headers.get('Content-Range')).toBe('bytes 0-1/5')
    expect(response.headers.get('Content-Length')).toBe('2')
    expect(await response.text()).toBe('by')
  })

  it('serves the whole file for a range it cannot pass on to R2', async () => {
    stored.set('programme.pdf', { body: 'bytes', contentType: 'application/pdf' })

    for (const headers of [
      { Range: 'bytes=0-1,3-4' },
      { Range: 'bytes=abc' },
      { 'If-Range': '"revision-0"', Range: 'bytes=0-1' },
    ]) {
      const response = await request(route, 'programme.pdf', { headers })

      expect(response.status).toBe(200)
      expect(await response.text()).toBe('bytes')
      expect(sent.at(-1)?.input.Range).toBeUndefined()
    }
  })

  it('answers a revalidation of the stored file with a 304, dropping the body', async () => {
    stored.set('photo.webp', { body: 'bytes', contentType: 'image/webp' })

    const response = await request(route, 'photo.webp', {
      headers: { 'If-None-Match': 'W/"revision-1"' },
    })

    expect(response.status).toBe(304)
    expect(response.body).toBeNull()
    expect(response.headers.get('ETag')).toBe('"revision-1"')
    expect(response.headers.get('Cache-Control')).toBe(collectionCacheControl())
    expect(cancelled).toEqual(['photo.webp'])
  })

  it('answers HEAD from the file’s metadata, opening no body', async () => {
    stored.set('photo.webp', { body: 'bytes', contentType: 'image/webp' })

    const response = await request(route, 'photo.webp', { method: 'HEAD' })

    expect(response.status).toBe(200)
    expect(response.body).toBeNull()
    expect(response.headers.get('Content-Length')).toBe('5')
    expect(response.headers.get('ETag')).toBe('"revision-1"')
    expect(sent.map(({ command }) => command)).toEqual(['HeadObject'])
  })

  it('answers a missing file and a range past its end itself, without Payload', async () => {
    stored.set('programme.pdf', { body: 'bytes', contentType: 'application/pdf' })

    const missing = await request(route, 'renamed.webp')
    const pastTheEnd = await request(route, 'programme.pdf', { headers: { Range: 'bytes=9-10' } })

    expect(missing.status).toBe(404)
    expect(pastTheEnd.status).toBe(416)
    expect(payloadGET).not.toHaveBeenCalled()
  })

  it('refuses a name Payload refuses, without asking the bucket', async () => {
    const response = await request(route, '..')

    expect(response.status).toBe(400)
    expect(sent).toEqual([])
  })

  it('lets any other error from the bucket through', async () => {
    stored.set('photo.webp', 403)

    await expect(request(route, 'photo.webp')).rejects.toThrow('R2 answered 403')
  })
})

describe('the media file route, in a local run', () => {
  it('leaves files on disk to Payload', async () => {
    const route = await loadRoute({ R2_BUCKET: '', USE_REMOTE_STORAGE: '' })

    const response = await request(route, 'photo.webp')

    expect(await response.text()).toBe('from Payload')
    expect(sent).toEqual([])
  })
})
