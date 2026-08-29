import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { PostView, postSlugs, queryPostBySlug } from '@/components/posts/PostView'
import { isProgramEntry, PROGRAMS_BASE, postPath } from '@/utilities/postPath'
import { generateMeta } from '@/seo/generateMeta'
import { redirect } from 'next/navigation'
import React from 'react'

/**
 * The registration status is worked out against today's date, so the page has
 * to be re-rendered on a clock rather than pinned to the last build: a deadline
 * passes on its own, with no edit to the post to revalidate it. Same hour the
 * listings use.
 */
export const revalidate = 3600

export async function generateStaticParams() {
  return postSlugs({ scheduled: true })
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Program({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
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
