import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { ArchiveSkeleton } from '@/components/CollectionArchive/ArchiveSkeleton'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { withoutPrograms } from '@/components/programs/filters'
import { servedAt } from '@/seo/servedAt'
import { NEWS_BASE, newsPagePath, NEWS_PAGE_SIZE } from '@/utilities/postPath'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'
import { cacheLife } from 'next/cache'

const TITLE = 'Actualités'
const DESCRIPTION =
  'Les actualités, comptes-rendus de sorties et informations de la vie associative des Randonnées Touloises.'

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

/**
 * One page of the listing, cached per page number on the same ten minute
 * cadence as the first page. The cache sits here rather than around the whole
 * component so resolving the route's params — and the 404 for a page number
 * that is not one — stays outside it.
 */
const getNewsPage = async (pageNumber: number) => {
  'use cache'
  cacheLife('tenMinutes')

  const payload = await getPayload({ config: configPromise })

  return payload.find({
    collection: 'posts',
    depth: 1,
    limit: NEWS_PAGE_SIZE,
    page: pageNumber,
    overrideAccess: false,
    where: withoutPrograms,
  })
}

/**
 * The page number is read here rather than below the boundary because a page
 * number that is not one answers 404, and a status cannot be changed once the
 * response has begun. Every number `generateStaticParams` returns is known at
 * build time, so those pages still prerender; only an address that was never
 * generated blocks.
 *
 * The posts themselves stay below the boundary, so the heading paints while the
 * listing streams in.
 */
export const instant = false

export default async function Page({ params }: Args) {
  const { pageNumber } = await params

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{TITLE}</h1>
        </div>
      </div>

      <Suspense fallback={<ArchiveSkeleton />}>
        <Listing pageNumber={sanitizedPageNumber} />
      </Suspense>
    </div>
  )
}

async function Listing({ pageNumber }: { pageNumber: number }) {
  const posts = await getNewsPage(pageNumber)

  return (
    <>
      <div className="container mb-8">
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
    </>
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

  // Page one always exists, even with nothing published yet: the listing renders
  // empty rather than 404ing, and Cache Components rejects a
  // `generateStaticParams` that returns nothing.
  const totalPages = Math.max(1, Math.ceil(totalDocs / NEWS_PAGE_SIZE))

  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
