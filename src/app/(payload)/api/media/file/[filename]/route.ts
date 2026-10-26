import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3'
import config from '@payload-config'
import { REST_GET, REST_OPTIONS } from '@payloadcms/next/routes'
import { sanitizeFilename } from 'payload/shared'

import { Media } from '@/collections/Media'
import { withMediaCacheControl } from '@/utilities/mediaCacheTag'
import { mediaStorage } from '@/utilities/mediaStorage'

/**
 * The one REST path whose answer depends on how it was asked for.
 *
 * Payload generates `api/[...slug]/route.ts` and serves every REST path from
 * that catch-all, uploads included. Next matches the longer static prefix
 * first, so this sits in front of it for `/api/media/file/<filename>` alone,
 * serves the file, and then decides what the response may be cached as — see
 * `withMediaCacheControl`, which explains why that decision cannot be made in
 * the collection or in `next.config.js`.
 */
const payloadGET = REST_GET(config)
const payloadOPTIONS = REST_OPTIONS(config)

/**
 * Files are read from the bucket here rather than through Payload, whose handler
 * wakes Neon twice over: starting Payload opens a database connection, and the
 * storage adapter then queries the media table for the file's key. That key is
 * always the filename, since `mediaStorage` enables no client uploads. Payload
 * serves local runs only, which keep uploads on disk.
 *
 * Payload's CORS headers and its `?prefix=` parameter are left out: `cors`
 * allows only the site's own origin, which needs no CORS headers, and no file
 * has a prefix.
 */
const r2 = mediaStorage.enabled ? new S3Client(mediaStorage.config) : null

/** Payload's policy and test for XML-family uploads, so an SVG opened on its own runs no script. */
const XML_CONTENT_SECURITY_POLICY = "script-src 'none'; frame-src 'none'; object-src 'none'"

const isXml = (contentType: string) => {
  const essence = contentType.split(';')[0].trim().toLowerCase()

  return essence === 'application/xml' || essence === 'text/xml' || essence.endsWith('+xml')
}

const withCollectionHeaders = (headers: Headers) =>
  (typeof Media.upload === 'object' && Media.upload.modifyResponseHeaders?.({ headers })) || headers

type Stored = { ContentLength?: number; ContentRange?: string; ContentType?: string; ETag?: string }

const fileHeaders = ({ ContentLength, ContentRange, ContentType, ETag }: Stored) => {
  const contentType = ContentType ?? 'application/octet-stream'
  const headers = new Headers({ 'Accept-Ranges': 'bytes', 'Content-Type': contentType })

  if (ContentLength !== undefined) headers.set('Content-Length', String(ContentLength))
  if (ContentRange) headers.set('Content-Range', ContentRange)
  if (ETag) headers.set('ETag', ETag)
  if (isXml(contentType)) headers.set('Content-Security-Policy', XML_CONTENT_SECURITY_POLICY)

  return withCollectionHeaders(headers)
}

/** Whether `If-None-Match` names the stored file, compared weakly as RFC 9110 asks. */
const alreadyHeld = (request: Request, etag: string | undefined): etag is string => {
  const tags = request.headers.get('If-None-Match')

  if (!tags || !etag) return false

  const opaque = (tag: string) => tag.trim().replace(/^W\//, '')

  return tags.split(',').some((tag) => tag.trim() === '*' || opaque(tag) === opaque(etag))
}

const notModified = (etag: string) =>
  new Response(null, { headers: withCollectionHeaders(new Headers({ ETag: etag })), status: 304 })

/**
 * One well-formed range, passed on to R2. Any other is ignored, as RFC 9110
 * allows, and so is a range under `If-Range`, whose validator R2 cannot check.
 */
const rangeFor = (request: Request) => {
  const range = request.headers.get('Range')

  return range && !request.headers.has('If-Range') && /^bytes=(\d+-\d*|-\d+)$/.test(range)
    ? range
    : undefined
}

/** R2's status for a request the visitor got wrong: a missing file, or a range past its end. */
const visitorError = (error: unknown) => {
  const status = error instanceof S3ServiceException ? error.$metadata.httpStatusCode : undefined

  return status === 404 || status === 416 ? status : undefined
}

/** A 416 names the file's length, as RFC 9110 asks, so a client can tell where the file ends. */
const rangeNotSatisfiable = ({ ContentLength }: Stored) =>
  new Response(null, {
    headers: ContentLength === undefined ? {} : { 'Content-Range': `bytes */${ContentLength}` },
    status: 416,
  })

/** The key Payload's adapter would store the file under, or `null` for a name it refuses. */
const keyFor = (filename: string) => {
  try {
    return sanitizeFilename(filename)
  } catch {
    return null
  }
}

const fromBucket = async (bucket: S3Client, request: Request, filename: string) => {
  const key = keyFor(filename)

  if (!key) return new Response(null, { status: 400 })

  const target = { Bucket: mediaStorage.bucket, Key: key }
  const options = { abortSignal: request.signal }

  try {
    if (request.method === 'HEAD') {
      const object = await bucket.send(new HeadObjectCommand(target), options)

      return alreadyHeld(request, object.ETag)
        ? notModified(object.ETag)
        : new Response(null, { headers: fileHeaders(object) })
    }

    const object = await bucket.send(
      new GetObjectCommand({ ...target, Range: rangeFor(request) }),
      options,
    )

    if (alreadyHeld(request, object.ETag)) {
      await object.Body?.transformToWebStream().cancel()

      return notModified(object.ETag)
    }

    return new Response(object.Body?.transformToWebStream() ?? null, {
      headers: fileHeaders(object),
      status: object.ContentRange ? 206 : 200,
    })
  } catch (error) {
    const status = visitorError(error)

    if (status === 416) {
      return rangeNotSatisfiable(await bucket.send(new HeadObjectCommand(target), options))
    }
    if (status) return new Response(null, { status })

    throw error
  }
}

type Args = { params: Promise<{ filename: string }> }

/** What the catch-all would have received for this path. */
const restParams = (filename: string) => Promise.resolve({ slug: ['media', 'file', filename] })

export const GET = async (request: Request, { params }: Args): Promise<Response> => {
  const { filename } = await params
  const response = r2
    ? await fromBucket(r2, request, filename)
    : await payloadGET(request, { params: restParams(filename) })

  return withMediaCacheControl(request, response)
}

/**
 * Answered from the file's metadata. Without a HEAD of its own, Next would run
 * GET and drop the body unread, and every such body holds one of the S3
 * client's sockets until R2 gives up on it.
 */
export const HEAD = GET

/**
 * Claiming the path from the catch-all claims it for every method, so the
 * preflight has to be handed back too — otherwise a cross-origin request for a
 * file would meet a 405 where it used to meet Payload's CORS headers.
 */
export const OPTIONS = async (request: Request, { params }: Args): Promise<Response> => {
  const { filename } = await params

  return payloadOPTIONS(request, { params: restParams(filename) })
}
