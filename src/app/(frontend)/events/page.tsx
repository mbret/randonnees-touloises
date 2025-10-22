import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { headers as getHeaders } from 'next/headers.js'
import { generateMeta } from '@/seo/generateMeta'

export const dynamic = 'force-static'

export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })
  const headers = await getHeaders()
  const { user } = await payload.auth({ headers })

  const posts = await payload.find({
    collection: 'events',
    depth: 1,
    limit: 12,
    user,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      categories: true,
      meta: true,
      authors: true,
      populatedAuthors: true,
      heroImage: true,
      publishedAt: true,
    },
  })

  return (
    <div className="pt-12 pb-12 md:pt-20 md:pb-20">
      <PageClient />
      <div className="container prose dark:prose-invert mb-12 text-center sm:mb-16 lg:mb-24">
        <h1 className="scroll-m-20">
          <span className="relative z-10">Événements</span>
        </h1>
        <p className="text-muted-foreground text-">Découvrez les événements à venir et passés.</p>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="events"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} relationTo="events" />

      <div className="container">
        {posts.totalPages > 1 && posts.page && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return generateMeta({
    doc: {
      title: 'Événements',
      meta: {
        title: 'Événements',
      },
    },
  })
}
