import type { S3ClientConfig } from '@aws-sdk/client-s3'

/**
 * Media lives in Cloudflare R2 in production. One bucket serves every
 * environment, so keep local runs off it — without the adapter Payload stores
 * uploads on disk under the collection's `staticDir`, and a local upload or
 * delete can no longer touch the files production serves. Set
 * USE_REMOTE_STORAGE=1 for the occasions a workstation does need the bucket,
 * such as importing media into production.
 */
const wantsRemoteStorage =
  process.env.NODE_ENV === 'production' || process.env.USE_REMOTE_STORAGE === '1'

/**
 * Also require the credentials to be there: a deploy that reaches production
 * before the bucket variables are set should fall back to disk — media 404s,
 * the same as an empty bucket — rather than have every request fail inside an
 * S3 client that has nothing to talk to.
 */
export const useRemoteStorage = wantsRemoteStorage && Boolean(process.env.R2_BUCKET)

export const MEDIA_BUCKET = process.env.R2_BUCKET || ''

export const mediaBucketConfig: S3ClientConfig = {
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
  endpoint: process.env.R2_ENDPOINT || '',
  // R2 has no regions, and accepts the bucket in the path rather than in
  // the hostname.
  forcePathStyle: true,
  region: 'auto',
}
