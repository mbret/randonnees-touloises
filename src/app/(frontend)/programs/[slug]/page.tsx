import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { PostView, postSlugs, queryPostBySlug } from '@/components/posts/PostView'
import { isProgramEntry, PROGRAMS_BASE, postPath } from '@/utilities/postPath'
import { generateMeta } from '@/seo/generateMeta'
import { redirect } from 'next/navigation'
import React from 'react'

/**
 * The registration status is worked out against today's date, so the page has to
 * be re-rendered on a clock rather than pinned to the last build: a deadline
 * passes on its own, with no edit to the post to revalidate it.
 *
 * That hour is no longer declared here — Cache Components does not accept
 * `export const revalidate` — but comes from the `cacheLife('hours')` on the
 * cached post lookup, which is what gives this route its one hour window.
 */
export async function generateStaticParams() {
  return postSlugs({ scheduled: true })
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

/**
 * Every entry `generateStaticParams` returns is prerendered in full, so the
 * common case is a static file rather than a render.
 *
 * The lookup deliberately sits here rather than below a `<Suspense>` boundary.
 * Whether the entry exists decides the status code, and a status cannot be
 * changed once the response has begun — behind a boundary the shell commits a
 * 200 and a slug that is gone answers 200 with the not-found page inside it. A
 * slug that was never prerendered therefore blocks, which is the right trade for
 * a route where the alternative is a soft 404.
 */
export const instant = false

export default async function Program({ params }: Args) {
  const { slug = '' } = await params
  const url = `${PROGRAMS_BASE}/${slug}`
  const post = await queryPostBySlug({ slug })

  if (!post) return <PayloadRedirects url={url} />

  // Only dated posts live here; anything else is news and has its own address.
  if (!isProgramEntry(post)) redirect(postPath(post))

  return (
    <>
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />
      <PostView post={post} />
    </>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const post = await queryPostBySlug({ slug })

  return generateMeta({ collection: 'posts', doc: post })
}
