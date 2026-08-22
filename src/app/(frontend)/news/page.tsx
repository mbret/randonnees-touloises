import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import { getNewsPage } from '@/components/posts/getNewsPage'
import { servedAt } from '@/seo/servedAt'
import { NEWS_PAGE_SIZE } from '@/utilities/postPath'
import React from 'react'
import PageClient from './page.client'

const TITLE = 'Actualités'
const DESCRIPTION =
  'Les actualités, comptes-rendus de sorties et informations de la vie associative des Randonnées Touloises.'

export default async function Page() {
  const posts = await getNewsPage(1)

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
