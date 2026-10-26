// @vitest-environment node

import { NoSuchKey, S3ServiceException, type GetObjectCommandInput } from '@aws-sdk/client-s3'
import { UPLOAD_CONTENT_SECURITY_POLICY } from 'payload/internal'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { publicAccess } from '@/access/publicAccess'
import { Media } from '@/collections/Media'
import { getMediaUrl } from '@/utilities/getMediaUrl'

const ROUTE = '@/app/(payload)/api/media/file/[filename]/route'

const stored = new Map<string, { body: string; contentType: string }>()
const asked: GetObjectCommandInput[] = []
const payloadGET = vi.fn(async () => new Response('from Payload'))

/** R2 as the route sees it: whole files, byte ranges, and the errors it throws for neither. */
const fromBucket = async (input: GetObjectCommandInput) => {
  asked.push(input)
  const object = stored.get(input.Key ?? '')

  if (!object) throw new NoSuchKey({ $metadata: {}, message: 'The specified key does not exist.' })

  const range = input.Range?.match(/^bytes=(\d+)-(\d+)$/)
  const [start, end] = range ? [Number(range[1]), Number(range[2])] : [0, object.body.length - 1]

  if (start >= object.body.length) {
    throw new S3ServiceException({
      $fault: 'client',
      $metadata: { httpStatusCode: 416 },
      message: 'The requested range is not satisfiable',
      name: 'InvalidRange',
    })
  }

  const body = object.body.slice(start, end + 1)

  return {
    Body: { transformToWebStream: () => new Response(body).body },
    ContentLength: body.length,
    ContentRange: range ? `bytes ${start}-${end}/${object.body.length}` : undefined,
    ContentType: object.contentType,
    ETag: '"revision-1"',
  }
}

vi.mock('@aws-sdk/client-s3', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@aws-sdk/client-s3')>()),
  S3Client: class {
    send = ({ input }: { input: GetObjectCommandInput }) => fromBucket(input)
  },
}))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@payloadcms/next/routes', () => ({ REST_GET: () => payloadGET, REST_OPTIONS: vi.fn() }))

type Route = typeof import('@/app/(payload)/api/media/file/[filename]/route')

/** Imports the route with these variables set, since it decides where files live as it loads. */
const loadRoute = async (env: Record<string, string>): Promise<Route> => {
  Object.entries(env).forEach(([name, value]) => vi.stubEnv(name, value))
  const route: Route = await import(ROUTE)
  vi.unstubAllEnvs()

  return route
}

const get = (route: Route, filename: string, { headers = {}, revision = '' } = {}) =>
  route.GET(
    new Request(`https://example.test${getMediaUrl(`/api/media/file/${filename}`, revision)}`, {
      headers,
    }),
    { params: Promise.resolve({ filename }) },
  )

const collectionCacheControl = () =>
  (Media.upload as { modifyResponseHeaders: (args: { headers: Headers }) => Headers })
    .modifyResponseHeaders({ headers: new Headers() })
    .get('Cache-Control')

afterEach(() => {
  stored.clear()
  asked.length = 0
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

    const response = await get(route, 'photo.webp', { revision: '2026-01-01T00:00:00.000Z' })

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('bytes')
    expect(response.headers.get('Content-Type')).toBe('image/webp')
    expect(response.headers.get('ETag')).toBe('"revision-1"')
    expect(response.headers.get('Cache-Control')).toContain('immutable')
    expect(asked).toEqual([{ Bucket: 'media', Key: 'photo.webp', Range: undefined }])
    expect(payloadGET).not.toHaveBeenCalled()
  })

  it('answers a URL naming no revision with the collection’s own window', async () => {
    stored.set('photo.webp', { body: 'bytes', contentType: 'image/webp' })

    const response = await get(route, 'photo.webp')

    expect(response.headers.get('Cache-Control')).toBe(collectionCacheControl())
  })

  it('keeps scripts out of an SVG, as Payload does', async () => {
    stored.set('logo.svg', { body: '<svg/>', contentType: 'image/svg+xml' })
    stored.set('photo.webp', { body: 'bytes', contentType: 'image/webp' })

    const svg = await get(route, 'logo.svg')
    const photo = await get(route, 'photo.webp')

    expect(svg.headers.get('Content-Security-Policy')).toBe(UPLOAD_CONTENT_SECURITY_POLICY)
    expect(photo.headers.get('Content-Security-Policy')).toBeNull()
  })

  it('serves the part of a file a range asks for', async () => {
    stored.set('programme.pdf', { body: 'bytes', contentType: 'application/pdf' })

    const response = await get(route, 'programme.pdf', { headers: { Range: 'bytes=0-1' } })

    expect(response.status).toBe(206)
    expect(response.headers.get('Content-Range')).toBe('bytes 0-1/5')
    expect(await response.text()).toBe('by')
  })

  it('leaves a file the bucket does not hold under its name to Payload', async () => {
    const response = await get(route, 'renamed.webp')

    expect(payloadGET).toHaveBeenCalledOnce()
    expect(await response.text()).toBe('from Payload')
  })

  it('leaves a range past the end of the file to Payload', async () => {
    stored.set('programme.pdf', { body: 'bytes', contentType: 'application/pdf' })

    await get(route, 'programme.pdf', { headers: { Range: 'bytes=9-10' } })

    expect(payloadGET).toHaveBeenCalledOnce()
  })
})

describe('the media file route, in a local run', () => {
  it('leaves files on disk to Payload', async () => {
    vi.resetModules()
    const route = await loadRoute({ R2_BUCKET: '', USE_REMOTE_STORAGE: '' })

    const response = await get(route, 'photo.webp')

    expect(await response.text()).toBe('from Payload')
    expect(asked).toEqual([])
  })
})
