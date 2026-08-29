import React from 'react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'
import { formatAuthors } from '@/utilities/formatAuthors'
import { formatSchedule } from '@/components/programs/formatSchedule'
import { RegistrationStatus } from '@/components/programs/RegistrationStatus'
import { registrationStatus } from '@/components/programs/registrationStatus'
import { dayInFrance } from '@/utilities/parisDay'
import { getCachedMedias } from '@/metadata/getMedias'

type HeadingProps = {
  authors?: string
  /** Set over a photo, where the heading is white and the pills must follow. */
  onImage?: boolean
  /** The outing's own day, for the deadline's year. */
  startDate?: string
  status?: ReturnType<typeof registrationStatus>
  title: string
  /** When the entry happens, for the posts that are programme entries. */
  when?: string
}

/** The title and its two subtitles, shared by both treatments below. */
function PostHeading({ authors, onImage, startDate, status, title, when }: HeadingProps) {
  return (
    <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
      <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>

      {(when || authors) && (
        <div className="flex flex-col gap-1 text-sm md:flex-row md:gap-8">
          {when && <p>{when}</p>}
          {authors && <p>Par {authors}</p>}
        </div>
      )}

      {/* Its own line rather than a third column beside the date and the
          author: on an entry that is full this is the one thing a reader came
          to find out, and it is lost among them. */}
      {status && (
        <div className="mt-3">
          <RegistrationStatus
            /* The pills carry theme colours, which are the page's own and go
               invisible against a photo. Over one they take the heading's
               white instead. */
            className={
              onImage
                ? '[&>span]:bg-transparent [&>span]:text-white [&>span]:ring-white/50'
                : undefined
            }
            startDate={startDate}
            status={status}
          />
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

  const startDate = schedule?.startDate ? dayInFrance(schedule.startDate) : undefined
  const status = registrationStatus({
    deadline: schedule?.registrationDeadline
      ? dayInFrance(schedule.registrationDeadline)
      : undefined,
    isFull: schedule?.isFull,
  })

  const onImage = Boolean(media) && typeof media !== 'string'
  const heading = (
    <PostHeading
      authors={authors || undefined}
      onImage={onImage}
      startDate={startDate}
      status={status}
      title={title}
      when={when}
    />
  )

  if (!onImage) {
    return <header className="container">{heading}</header>
  }

  return (
    <div className="relative flex items-end">
      <div className="container relative z-10 pb-8 text-white">{heading}</div>
      <div className="min-h-[50vh] select-none md:min-h-[60vh]">
        <Media fill priority imgClassName="-z-10 object-cover" resource={media} />
        <div className="bg-linear-to-t pointer-events-none absolute bottom-0 left-0 h-[90%] w-full from-black to-transparent" />
      </div>
    </div>
  )
}
