import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { PostView, postSlugs, queryPostBySlug } from '@/components/posts/PostView'
import { isProgramEntry, NEWS_BASE, postPath } from '@/utilities/postPath'
import { generateMeta } from '@/seo/generateMeta'
import { redirect } from 'next/navigation'
import React from 'react'

export async function generateStaticParams() {
  return postSlugs({ scheduled: false })
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
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
