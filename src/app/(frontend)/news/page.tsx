import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { withoutPrograms } from '@/components/programs/filters'
import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { headers as getHeaders } from 'next/headers.js'

export const dynamic = 'force-static'

export const revalidate = 600

const TITLE = 'Actualités'
const DESCRIPTION =
  'Les actualités, comptes-rendus de sorties et informations de la vie associative des Randonnées Touloises.'

export default async function Page() {
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    user,
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
      <div className="container mx-auto mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{TITLE}</h1>
        </div>
      </div>

      <div className="container mx-auto mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
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
  openGraph: mergeOpenGraph({
    description: DESCRIPTION,
    title: TITLE,
    url: '/news',
  }),
  title: TITLE,
}
