import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

import { breadcrumbJsonLd, pageTrail } from '@/seo/jsonld/breadcrumbs'
import { JsonLd } from '@/seo/jsonld/JsonLd'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/seo/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

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

  return pages.docs?.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

/**
 * Whether the page exists decides the status code, and a status cannot be
 * changed once the response has begun, so the lookup has to finish before
 * anything is sent. That rules out resolving it below a `<Suspense>` boundary:
 * the shell would commit a 200 and a missing page would answer 200 with the
 * not-found page inside it.
 *
 * So this route is allowed to block. The pages it knows about are still
 * prerendered from `generateStaticParams`; only a slug that was never generated
 * pays for the lookup, which is the case that answers 404.
 */
export const instant = false

export default async function Page({ params }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await params
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

      {draft && <LivePreviewListener />}

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

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
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
