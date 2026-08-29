import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { PostView, queryPostBySlug } from '@/components/posts/PostView'
import { isProgramEntry, NEWS_BASE, postPath } from '@/utilities/postPath'
import { generateMeta } from '@/seo/generateMeta'
import { redirect } from 'next/navigation'
import React from 'react'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

/**
 * Whether the post exists decides the status code, and a status cannot be
 * changed once the response has begun, so the lookup has to finish before
 * anything is sent. That rules out resolving it below a `<Suspense>` boundary:
 * the shell would commit a 200 and a missing post would answer 200 with the
 * not-found page inside it.
 *
 * So this route is allowed to block. There is also no `generateStaticParams`
 * here — every post carrying a date belongs to the programme, so this namespace
 * is frequently empty, and Cache Components rejects one that returns nothing.
 * The lookup is cached, so blocking on it is a cache read rather than a query.
 */
export const instant = false

export default async function Post({ params }: Args) {
  const { slug = '' } = await params
  const url = `${NEWS_BASE}/${slug}`
  const post = await queryPostBySlug({ slug })

  if (!post) return <PayloadRedirects url={url} />

  // A post that has since been given a date belongs to the programme; send the
  // reader to its own address rather than serving it from two.
  if (isProgramEntry(post)) redirect(postPath(post))

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
