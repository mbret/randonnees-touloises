import React from 'react'

import { ExternalLinkIcon } from 'lucide-react'
import NextImage from 'next/image'

import type { MediaLinksBlock as MediaLinksBlockProps } from '@/payload-types'

import { Card, CardContent } from '@/components/ui/card'
import { Media } from '@/components/Media'
import { dayInFrance } from '@/utilities/parisDay'

import { mediaPlatformIcons } from './platformIcons'
import { mediaPlatformActions, mediaPlatformLabels } from './platforms'
import { isSquarish, resolveThumbnail } from './thumbnails'

/**
 * The day an entry carries, in French.
 *
 * Read at noon UTC and printed in UTC, the way the agenda does it: the stored
 * value is a `dayOnly` timestamp, so it is midnight in whichever timezone the
 * editor sat in, and only `dayInFrance` recovers the day they meant.
 */
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(`${dayInFrance(value)}T12:00:00Z`))

/**
 * Three cards to a row past `lg`, two from `sm`. The container caps at 64rem,
 * so a card's image is never wider than ~300px on the widest screen and ~50vw
 * on a tablet — what `sizes` tells the browser to fetch.
 */
const IMAGE_SIZES = '(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw'

export const MediaLinksBlock: React.FC<MediaLinksBlockProps> = async ({ items }) => {
  if (!items?.length) return null

  /* Resolved together rather than one after another: five links that each take
   * a moment to answer should cost one moment, not five. A row an editor gave a
   * picture to is not asked about at all — their choice outranks the automatic
   * one, and skipping it also skips the request. */
  const thumbnails = await Promise.all(
    items.map((item) => (item.cover ? null : resolveThumbnail(item.url))),
  )

  return (
    <div className="container">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 list-none p-0">
        {items.map(({ cover, date, description, id, platform, title, url }, index) => {
          const Icon = mediaPlatformIcons[platform]
          const thumbnail = thumbnails[index]

          return (
            <li key={id ?? url}>
              {/* The whole card is the link, rather than a button inside it:
                  a target the width of a card is the one a thumb hits on a
                  phone. `group` is what lets the label underline on hover of
                  anywhere in it.

                  Opened in a new tab because both destinations are somebody
                  else's application — a visitor who lands in the Google Photos
                  viewer has no obvious way back to a page they never left. */}
              <a
                className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                href={url}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
                  <div className="bg-muted relative flex aspect-video items-center justify-center">
                    {cover ? (
                      <Media
                        className="absolute inset-0"
                        fill
                        imgClassName="object-cover"
                        resource={cover}
                        size={IMAGE_SIZES}
                      />
                    ) : thumbnail ? (
                      /* The picture the link publishes of itself. Empty `alt`:
                         it illustrates the title rather than adding to it, and
                         it sits inside a link that already reads as the album
                         it opens — announcing it twice helps nobody.

                         A near-square picture is a channel avatar or a logo, so
                         it is fitted whole rather than cropped to the band. */
                      <NextImage
                        alt=""
                        className={isSquarish(thumbnail) ? 'object-contain p-6' : 'object-cover'}
                        fill
                        sizes={IMAGE_SIZES}
                        src={thumbnail.src}
                      />
                    ) : (
                      /* Neither a chosen picture nor one to be had: the
                         platform's own icon, large enough to read as the subject
                         of the card rather than as a gap where an image failed
                         to load. */
                      <Icon aria-hidden className="text-muted-foreground/60 size-12" />
                    )}
                  </div>

                  <CardContent className="py-6">
                    <p className="text-muted-foreground flex items-center gap-2 text-xs">
                      <Icon aria-hidden className="size-4 shrink-0" />
                      <span>{mediaPlatformLabels[platform]}</span>
                      {date && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{formatDate(date)}</span>
                        </>
                      )}
                    </p>

                    <p className="mt-2 font-semibold">{title}</p>

                    {description && (
                      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
                    )}

                    <p className="text-primary mt-4 flex items-center gap-1.5 text-sm group-hover:underline">
                      {mediaPlatformActions[platform]}
                      <ExternalLinkIcon aria-hidden className="size-3.5" />
                    </p>
                  </CardContent>
                </Card>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
