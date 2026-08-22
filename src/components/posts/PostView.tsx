import configPromise from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React, { cache } from 'react'

import type { Post } from '@/payload-types'

import { breadcrumbJsonLd, postTrail } from '@/seo/jsonld/breadcrumbs'
import { JsonLd } from '@/seo/jsonld/JsonLd'
import { DraftPreviewListener } from '@/components/LivePreviewListener/DraftPreviewListener'
import { PostHero } from '@/heros/PostHero'
import { programEventJsonLd } from '@/seo/jsonld/event'
import { PostViewClient } from './PostViewClient'
import { PublishedAt } from './PublishedAt'
import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import RichText from '@/components/RichText'
import { WithContentProtectedPassword } from '@/components/auth/WithContentProtectedPassword'
import { withoutPrograms } from '@/components/programs/filters'

/** One post, rendered the same whichever namespace served it. */
export async function PostView({ post }: { post: Post }) {
  // Structured data for whichever kind of post this is: a dated entry is an
  // outing a reader can turn up to, an undated one only has its trail. Both sit
  // inside the password gate, so a post whose body is withheld does not describe
  // itself to a crawler either.
  const event = programEventJsonLd(post)
  const breadcrumbs = breadcrumbJsonLd(postTrail(post))

  return (
    <WithContentProtectedPassword required={post.requireContentPassword}>
      <article className="pt-16 pb-16">
        <PostViewClient />

        {event && <JsonLd data={event} />}
        {breadcrumbs && <JsonLd data={breadcrumbs} />}

        <DraftPreviewListener />

        <PostHero post={post} />

        <div className="flex flex-col items-center gap-4 pt-8">
          <div className="container">
            <RichText className="max-w-none" data={post.content} enableGutter={false} />
            <PublishedAt value={post.publishedAt} />
            {post.relatedPosts && post.relatedPosts.length > 0 && (
              <RelatedPosts
                className="mt-12"
                docs={post.relatedPosts.filter((related) => typeof related === 'object')}
              />
            )}
          </div>
        </div>
      </article>
    </WithContentProtectedPassword>
  )
}

/**
 * The document behind a slug, cached rather than re-read on every render — which
 * is what lets these routes be prerendered at all; an uncached read here had
 * every article rendering per request.
 *
 * Invalidation is by path, not by this tag: `revalidatePost` revalidates the
 * document's own address on every write, and Next drops what that render
 * touched, this entry included. The tag is declared for the same reason
 * `getCachedDocument` declares one — it names the entry, should it ever need
 * dropping on its own — and the ten minutes is the backstop, deliberately short
 * because the path is doing the real work. A long life here would put a stale
 * article behind an editor's save if that ever stopped holding, and the hooks
 * cannot fire a per-document tag instead: autosave calls them on a 100ms timer.
 *
 * `draftMode` is read in here rather than passed in, which is allowed where
 * `cookies` and `headers` are not — and is what keeps a preview honest: with
 * draft mode on, Next re-executes every cached scope per request and stores
 * nothing, so an editor sees their unsaved work and no draft is ever written into
 * the entry the public reads.
 */
export const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  'use cache'
  cacheLife('listing')
  cacheTag(`posts_${slug}`)

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
