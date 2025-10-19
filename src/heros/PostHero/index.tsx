import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'
import { useMedias } from '@/metadata/MediaProvider'
import { getCachedMedias } from '@/metadata/getMedias'

export const PostHero: React.FC<{
  post: Post
}> = async ({ post }) => {
  const { categories, heroImage, populatedAuthors, publishedAt, title } = post
  const medias = await getCachedMedias()()
  const heroMedia = typeof heroImage === 'object' ? heroImage : null
  const placeholderMedia = medias?.find((m) => m.filename === 'post_placeholder')
  const media = heroMedia ?? placeholderMedia
  const hasAuthors =
    populatedAuthors && populatedAuthors.length > 0 && formatAuthors(populatedAuthors) !== ''

  return (
    <div className="relative /-mt-[10.4rem] flex items-end">
      <div className="container mx-auto z-10 relative lg:grid lg:grid-cols-[1fr_48rem_1fr] text-white pb-8">
        <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
          <div className="uppercase text-sm mb-6">
            {categories?.map((category, index) => {
              if (typeof category === 'object' && category !== null) {
                const { title: categoryTitle } = category

                const titleToUse = categoryTitle || 'Untitled category'

                const isLast = index === categories.length - 1

                return (
                  <React.Fragment key={index}>
                    {titleToUse}
                    {!isLast && <React.Fragment>, &nbsp;</React.Fragment>}
                  </React.Fragment>
                )
              }
              return null
            })}
          </div>

          <div className="">
            <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-16">
            {hasAuthors && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm">Author</p>

                  <p>{formatAuthors(populatedAuthors)}</p>
                </div>
              </div>
            )}
            {publishedAt && (
              <div className="flex flex-col gap-1">
                <p className="text-sm">Date de publication</p>

                <time dateTime={publishedAt}>
                  {new Date(publishedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </time>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="min-h-[50vh] md:min-h-[60vh] select-none">
        {media && typeof media !== 'string' && (
          <Media fill priority imgClassName="-z-10 object-cover" resource={media} />
        )}
        <div className="absolute pointer-events-none left-0 bottom-0 w-full h-[90%] bg-linear-to-t from-black to-transparent" />
      </div>
    </div>
  )
}
