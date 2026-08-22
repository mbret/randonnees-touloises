import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cacheLife, cacheTag } from 'next/cache'

export async function getRedirects(depth = 1) {
  const payload = await getPayload({ config: configPromise })

  const { docs: redirects } = await payload.find({
    collection: 'redirects',
    depth,
    limit: 0,
    pagination: false,
  })

  return redirects
}

/**
 * Every redirect in one entry rather than one per lookup: a miss is the common
 * case — most requests match no redirect at all — and a per-slug cache would
 * make each of those its own entry. Cached under the `redirects` tag, which the
 * collection's hook fires.
 */
export async function getCachedRedirects(depth = 1) {
  'use cache'
  cacheLife('max')
  cacheTag('redirects')

  return getRedirects(depth)
}
