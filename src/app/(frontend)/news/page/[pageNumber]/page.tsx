import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { withoutPrograms } from '@/components/programs/filters'
import { servedAt } from '@/seo/servedAt'
import { NEWS_BASE, newsPagePath, NEWS_PAGE_SIZE } from '@/utilities/postPath'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'

export const revalidate = 600

const TITLE = 'Actualités'
const DESCRIPTION =
  'Les actualités, comptes-rendus de sorties et informations de la vie associative des Randonnées Touloises.'

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: NEWS_PAGE_SIZE,
    page: sanitizedPageNumber,
    overrideAccess: false,
    where: withoutPrograms,
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mx-auto mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{TITLE}</h1>
        </div>
      </div>

      <div className="container mx-auto mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={NEWS_PAGE_SIZE}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} />

      <div className="container">
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise

  /**
   * Page one of the listing is `/news/page/1`, and it serves exactly what
   * `/news` serves. Both the canonical and the title name `/news` instead, so
   * the duplicate points at the address the sitemap advertises rather than
   * competing with it.
   */
  const page = Number(pageNumber)
  const path = newsPagePath(page)
  const title = path === NEWS_BASE ? TITLE : `${TITLE} — page ${page}`

  return {
    description: DESCRIPTION,
    ...servedAt(path, {
      description: DESCRIPTION,
    }),
    title,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
    where: withoutPrograms,
  })

  // Page one always exists, even before anything is published: the listing
  // renders empty rather than being served on demand.
  const totalPages = Math.max(1, Math.ceil(totalDocs / NEWS_PAGE_SIZE))

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
