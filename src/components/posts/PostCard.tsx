'use client'
import React from 'react'

import type { Post } from '@/payload-types'

import { BlogCard } from './BlogCard'
import { useMedias } from '@/metadata/MediaProvider'

export type CardPostData = Pick<
  Post,
  'slug' | 'categories' | 'meta' | 'title' | 'populatedAuthors' | 'heroImage' | 'publishedAt'
>

export const PostCard: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo: 'posts' | 'events'
  showCategories?: boolean
  title?: string
}> = ({ ...rest }) => {
  const medias = useMedias()
  const postAuthors = rest.doc?.populatedAuthors ?? []

  const authors =
    postAuthors.length > 0
      ? postAuthors.map((author) => ({ name: author.name ?? 'Inconnu' }))
      : [{ name: 'Inconnu' }]

  const placeholderMedia = medias.media?.find((m) => m.filename === 'post_placeholder')
  const heroMedia = typeof rest.doc?.heroImage === 'object' ? rest.doc?.heroImage : null
  const metaMedia = typeof rest.doc?.meta?.image === 'object' ? rest.doc?.meta?.image : null
  const media = heroMedia ?? metaMedia ?? placeholderMedia

  return <BlogCard {...rest} authors={authors} media={media} publishedAt={rest.doc?.publishedAt} />
}
