import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { PostView, postSlugs, queryPostBySlug } from '@/components/posts/PostView'
import { isProgramEntry, PROGRAMS_BASE, postPath } from '@/utilities/postPath'
import { generateMeta } from '@/seo/generateMeta'
import { redirect } from 'next/navigation'
import React from 'react'

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

  return generateMeta({ doc: post })
}
