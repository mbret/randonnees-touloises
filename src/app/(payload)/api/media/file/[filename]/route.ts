import config from '@payload-config'
import { REST_GET, REST_OPTIONS } from '@payloadcms/next/routes'

import { withMediaCacheControl } from '@/utilities/mediaCacheTag'

/**
 * The one REST path whose answer depends on how it was asked for.
 *
 * Payload generates `api/[...slug]/route.ts` and serves every REST path from
 * that catch-all, uploads included. Next matches the longer static prefix
 * first, so this sits in front of it for `/api/media/file/<filename>` alone,
 * hands the request straight to Payload, and then decides what the response may
 * be cached as — see `withMediaCacheControl`, which explains why that decision
 * cannot be made in the collection or in `next.config.js`.
 *
 * Nothing else about the response is ours: which storage adapter served it, the
 * range handling, the `ETag`, the 404 for a missing key, all of it is Payload's
 * and passes through untouched.
 */
const payloadGET = REST_GET(config)
const payloadOPTIONS = REST_OPTIONS(config)

type Args = { params: Promise<{ filename: string }> }

/** What the catch-all would have received for this path. */
const restParams = (filename: string) => Promise.resolve({ slug: ['media', 'file', filename] })

export const GET = async (request: Request, { params }: Args): Promise<Response> => {
  const { filename } = await params

  return withMediaCacheControl(request, await payloadGET(request, { params: restParams(filename) }))
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
