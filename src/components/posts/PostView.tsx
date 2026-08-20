import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import type { Post } from '@/payload-types'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { PostHero } from '@/heros/PostHero'
import { PostViewClient } from './PostViewClient'
import { PublishedAt } from './PublishedAt'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import RichText from '@/components/RichText'
import { WithContentProtectedPassword } from '@/components/auth/WithContentProtectedPassword'
import { withoutPrograms } from '@/components/programs/filters'

/** One post, rendered the same whichever namespace served it. */
export async function PostView({ post }: { post: Post }) {
  const { isEnabled: draft } = await draftMode()

  return (
    <WithContentProtectedPassword required={post.requireContentPassword}>
      <article className="pt-16 pb-16">
        <PostViewClient />

        {draft && <LivePreviewListener />}

        <PostHero post={post} />

        <div className="flex flex-col items-center gap-4 pt-8">
          <div className="container">
            <RichText className="mx-auto max-w-3xl" data={post.content} enableGutter={false} />
            <PublishedAt value={post.publishedAt} />
            {post.relatedPosts && post.relatedPosts.length > 0 && (
              <RelatedPosts
                className="col-start-1 col-span-3 mt-12 max-w-208 grid-rows-[2fr] lg:grid lg:grid-cols-subgrid"
                docs={post.relatedPosts.filter((related) => typeof related === 'object')}
              />
            )}
          </div>
        </div>
      </article>
    </WithContentProtectedPassword>
  )
}

export const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: { slug: { equals: slug } },
  })

  return result.docs?.[0] || null
})

/**
 * The slugs one namespace is responsible for, for `generateStaticParams`. The
 * other namespace redirects to it rather than building its own copy, so nothing
 * is generated twice.
 */
export const postSlugs = async ({ scheduled }: { scheduled: boolean }) => {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
    where: scheduled ? { 'schedule.startDate': { exists: true } } : withoutPrograms,
  })

  return docs.map(({ slug }) => ({ slug }))
}
