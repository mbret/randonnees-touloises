import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cacheLife, cacheTag } from 'next/cache'
import { draftMode } from 'next/headers'
import { withFallbackSlug } from '@/utilities/staticParams'
import React, { cache } from 'react'

import { breadcrumbJsonLd, pageTrail } from '@/seo/jsonld/breadcrumbs'
import { JsonLd } from '@/seo/jsonld/JsonLd'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/seo/generateMeta'
import PageClient from './page.client'
import { DraftPreviewListener } from '@/components/LivePreviewListener/DraftPreviewListener'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return withFallbackSlug(pages.docs?.map(({ slug }) => ({ slug })) ?? [])
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const url = '/' + slug

  const page = await queryPageBySlug({ slug })

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page
  const breadcrumbs = breadcrumbJsonLd(pageTrail(page))

  return (
    <article className="pt-6 pb-12">
      <PageClient />
      {breadcrumbs && <JsonLd data={breadcrumbs} />}
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      <DraftPreviewListener />

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const page = await queryPageBySlug({ slug })

  return generateMeta({ collection: 'pages', doc: page })
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
const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  'use cache'
  cacheLife('listing')
  cacheTag(`pages_${slug}`)

  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
