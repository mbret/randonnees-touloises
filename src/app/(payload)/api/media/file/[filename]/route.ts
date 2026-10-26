import { GetObjectCommand, NoSuchKey, S3Client, S3ServiceException } from '@aws-sdk/client-s3'
import config from '@payload-config'
import { REST_GET, REST_OPTIONS } from '@payloadcms/next/routes'
import { APIError } from 'payload'
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
 * always the filename, since `mediaStorage` enables no client uploads.
 *
 * Payload still answers local runs, which keep uploads on disk, and whatever the
 * bucket cannot. A conditional request gets the whole file, which HTTP allows.
 */
const bucket = mediaStorage.enabled ? new S3Client(mediaStorage.config) : null

/** Payload's policy for XML-family uploads, so an SVG opened on its own runs no script. */
const XML_CONTENT_SECURITY_POLICY = "script-src 'none'; frame-src 'none'; object-src 'none'"

const isXml = (contentType: string) =>
  /(^|[/+])xml$/.test(contentType.split(';')[0].trim().toLowerCase())

/** The collection's `modifyResponseHeaders`, which Payload applies to every file it serves. */
const withCollectionHeaders = (headers: Headers) =>
  (typeof Media.upload === 'object' && Media.upload.modifyResponseHeaders?.({ headers })) || headers

const fromBucket = async (request: Request, filename: string): Promise<Response | null> => {
  if (!bucket) return null

  try {
    const object = await bucket.send(
      new GetObjectCommand({
        Bucket: mediaStorage.bucket,
        Key: sanitizeFilename(filename),
        Range: request.headers.get('Range') ?? undefined,
      }),
    )
    const contentType = object.ContentType ?? 'application/octet-stream'
    const headers = new Headers({ 'Accept-Ranges': 'bytes', 'Content-Type': contentType })

    if (object.ContentLength !== undefined) {
      headers.set('Content-Length', String(object.ContentLength))
    }
    if (object.ContentRange) headers.set('Content-Range', object.ContentRange)
    if (object.ETag) headers.set('ETag', object.ETag)
    if (isXml(contentType)) headers.set('Content-Security-Policy', XML_CONTENT_SECURITY_POLICY)

    return new Response(object.Body?.transformToWebStream() ?? null, {
      headers: withCollectionHeaders(headers),
      status: object.ContentRange ? 206 : 200,
    })
  } catch (error) {
    // A name Payload refuses, a file stored under another key, or a range past
    // the end of the file: Payload answers each of them.
    if (
      error instanceof APIError ||
      error instanceof NoSuchKey ||
      (error instanceof S3ServiceException && error.$metadata.httpStatusCode === 416)
    ) {
      return null
    }

    throw error
  }
}

type Args = { params: Promise<{ filename: string }> }

/** What the catch-all would have received for this path. */
const restParams = (filename: string) => Promise.resolve({ slug: ['media', 'file', filename] })

export const GET = async (request: Request, { params }: Args): Promise<Response> => {
  const { filename } = await params
  const response =
    (await fromBucket(request, filename)) ??
    (await payloadGET(request, { params: restParams(filename) }))

  return withMediaCacheControl(request, response)
}

/**
 * Claiming the path from the catch-all claims it for every method, so the
 * preflight has to be handed back too — otherwise a cross-origin request for a
 * file would meet a 405 where it used to meet Payload's CORS headers.
 */
export const OPTIONS = async (request: Request, { params }: Args): Promise<Response> => {
  const { filename } = await params

  return payloadOPTIONS(request, { params: restParams(filename) })
}
