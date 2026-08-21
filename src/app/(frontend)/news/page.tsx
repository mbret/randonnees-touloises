import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { withoutPrograms } from '@/components/programs/filters'
import { servedAt } from '@/seo/servedAt'
import { NEWS_PAGE_SIZE } from '@/utilities/postPath'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'

export const dynamic = 'force-static'

export const revalidate = 600

const TITLE = 'Actualités'
const DESCRIPTION =
  'Les actualités, comptes-rendus de sorties et informations de la vie associative des Randonnées Touloises.'

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: NEWS_PAGE_SIZE,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      meta: true,
    },
    where: withoutPrograms,
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{TITLE}</h1>
        </div>
      </div>

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
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: DESCRIPTION,
  ...servedAt('/news', {
    description: DESCRIPTION,
  }),
  title: TITLE,
}
