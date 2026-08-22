import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { Skeleton } from '@/components/ui/skeleton'
import { servedAt } from '@/seo/servedAt'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { Suspense } from 'react'
import { Search } from '@/search/Component'
import PageClient from './page.client'
import { CardPostData } from '@/components/posts/PostCard'

const TITLE = 'Recherche'
const DESCRIPTION =
  'Recherchez une randonnée, une actualité ou une page du site des Randonnées Touloises.'

type Args = {
  searchParams: Promise<{
    q: string
  }>
}
/**
 * The heading and the search box are the same for every query, so they are what
 * this route prerenders: a reader arrives to a usable box immediately and only
 * the list below it waits on the term. Reading `searchParams` up here instead
 * would tie the whole page to one URL and leave nothing to prerender.
 */
export default function Page({ searchParams }: Args) {
  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none text-center">
          <h1 className="mb-8 lg:mb-16">Rechercher</h1>

          <div className="max-w-200 mx-auto">
            <Search />
          </div>
        </div>
      </div>

      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

const ResultsSkeleton = () => (
  <div className="container flex flex-col gap-4" aria-busy>
    {[0, 1, 2].map((row) => (
      <Skeleton className="h-24 w-full" key={row} />
    ))}
  </div>
)

async function Results({ searchParams: searchParamsPromise }: Args) {
  const { q: query } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'search',
    depth: 1,
    limit: 12,
    select: {
      title: true,
      slug: true,
      schedule: true,
      meta: true,
    },
    // pagination: false reduces overhead if you don't need totalDocs
    pagination: false,
    ...(query
      ? {
          where: {
            or: [
              {
                title: {
                  like: query,
                },
              },
              {
                'meta.description': {
                  like: query,
                },
              },
              {
                'meta.title': {
                  like: query,
                },
              },
              {
                slug: {
                  like: query,
                },
              },
            ],
          },
        }
      : {}),
  })

  if (posts.totalDocs === 0) {
    return <div className="container">Aucun résultat ne correspond à votre recherche.</div>
  }

  return <CollectionArchive posts={posts.docs as CardPostData[]} />
}

export function generateMetadata(): Metadata {
  return {
    description: DESCRIPTION,
    ...servedAt('/search', {
      description: DESCRIPTION,
    }),
    title: TITLE,
  }
}
