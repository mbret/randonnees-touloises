import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'
import { formatSchedule } from '@/components/programs/formatSchedule'
import { dayInFrance } from '@/utilities/parisDay'
import { getCachedMedias } from '@/metadata/getMedias'

type HeadingProps = {
  authors?: string
  title: string
  /** When the entry happens, for the posts that are programme entries. */
  when?: string
}

/** The title and its two subtitles, shared by both treatments below. */
function PostHeading({ authors, title, when }: HeadingProps) {
  return (
    <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
      <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>

      {(when || authors) && (
        <div className="flex flex-col gap-1 text-sm md:flex-row md:gap-8">
          {when && <p>{when}</p>}
          {authors && <p>Par {authors}</p>}
        </div>
      )}
    </div>
  )
}

/**
 * The head of a post.
 *
 * With an image it is the full-bleed treatment: the picture behind, a gradient
 * up from the bottom and the title in white over it. Without one there is
 * nothing to put behind the title, so the hero collapses to a plain header
 * rather than reserving 60vh of empty gradient — which is the normal case here,
 * since most programme entries carry no picture at all.
 *
 * The date shown is the date of the outing, not the day the post was written:
 * these are announcements, and `publishedAt` says nothing a reader wants. It
 * moves to the foot of the article instead.
 */
export const PostHero: React.FC<{
  post: Post
}> = async ({ post }) => {
  const { heroImage, populatedAuthors, schedule, title } = post
  const medias = await getCachedMedias()()
  const heroMedia = typeof heroImage === 'object' ? heroImage : null
  const placeholderMedia = medias?.find((m) => m.filename === 'post_placeholder')
  const media = heroMedia ?? placeholderMedia
  const authors =
    populatedAuthors && populatedAuthors.length > 0 ? formatAuthors(populatedAuthors) : ''
  const when = schedule?.startDate
    ? formatSchedule(
        dayInFrance(schedule.startDate),
        schedule.endDate ? dayInFrance(schedule.endDate) : undefined,
      )
    : undefined

  const heading = <PostHeading authors={authors || undefined} title={title} when={when} />

  if (!media || typeof media === 'string') {
    return <header className="container lg:grid lg:grid-cols-[1fr_48rem_1fr]">{heading}</header>
  }

  return (
    <div className="relative flex items-end">
      <div className="container relative z-10 mx-auto pb-8 text-white lg:grid lg:grid-cols-[1fr_48rem_1fr]">
        {heading}
      </div>
      <div className="min-h-[50vh] select-none md:min-h-[60vh]">
        <Media fill priority imgClassName="-z-10 object-cover" resource={media} />
        <div className="bg-linear-to-t pointer-events-none absolute bottom-0 left-0 h-[90%] w-full from-black to-transparent" />
      </div>
    </div>
  )
}
