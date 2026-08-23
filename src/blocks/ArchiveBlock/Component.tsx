import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { cacheLife, cacheTag } from 'next/cache'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'
import { withoutPrograms } from '@/components/programs/filters'

/**
 * The newest actualités, for a block set to populate from the collection.
 *
 * Cached, and it has to be: this runs inside whichever page carries the block,
 * and an uncached read there is what stops that page being prerendered — the
 * whole page then renders per request. Tagged with the news listing, so
 * `revalidatePost` refreshes it on the same writes that refresh `/news`.
 *
 * `overrideAccess: false` matters more here than it did before it was cached.
 * The local API overrides access by default, which skips the collection's
 * published-only read rule, so this query could return a draft — and a cached
 * draft is a published one. Every other public reader on the site passes this
 * for the same reason.
 */
const getArchivePosts = async (limit: number): Promise<Post[]> => {
  'use cache'
  cacheLife('listing')
  cacheTag('news')

  const payload = await getPayload({ config: configPromise })

  const { docs } = await payload.find({
    collection: 'posts',
    depth: 1,
    limit,
    overrideAccess: false,
    // An archive of posts means the actualités: the programme has a section of
    // its own, and its entries would otherwise bury the news here.
    where: withoutPrograms,
  })

  return docs
}

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { id, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []

  if (populateBy === 'collection') {
    posts = await getArchivePosts(limit)
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      posts = filteredSelectedPosts
    }
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText className="ms-0 max-w-3xl" data={introContent} enableGutter={false} />
        </div>
      )}
      <CollectionArchive posts={posts} />
    </div>
  )
}
