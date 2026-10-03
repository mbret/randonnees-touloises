import React from 'react'

import { ExternalLinkIcon } from 'lucide-react'
import NextImage from 'next/image'

import type { MediaLinksBlock as MediaLinksBlockProps } from '@/payload-types'

import { cn } from '@/components/ui'
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

/**
 * The size an automatic thumbnail is declared at, which is what decides the
 * widths the optimiser is asked for — not the size it is drawn at, which the
 * band decides.
 *
 * Declared rather than `fill`, because `fill` with `IMAGE_SIZES` offered every
 * width from 384 to 1920, and the picture behind it is a social card: 600
 * pixels wide for a Google Photos cover, 480 for a video still. The optimiser
 * does not enlarge, so the 828, 1200 and 1920 variants were the 640 one over
 * again, each billed as a transformation of its own — four in ten of the
 * covers' transformations, the week this was measured. A declared width yields
 * a `1x, 2x` pair instead, here 384 for a standard screen and 640, the whole
 * picture, for anything denser.
 *
 * Any width from 193 to 320 gives that pair. This one, at the band's 16:9, is
 * narrower than any band is drawn: in development Next warns about an image
 * drawn at its declared width but not its declared height, or the reverse, and
 * a desktop band — about 302 by 170 — could set that off against 300 by 169.
 * The picture is laid over a band that already has its shape, so the size
 * reserves nothing either way.
 */
const THUMBNAIL_SIZE = { width: 256, height: 144 }

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
                         it is fitted whole rather than cropped to the band.

                         Laid over the band by hand rather than with `fill`,
                         which would ask for widths the picture does not have —
                         see `THUMBNAIL_SIZE`. */
                      <NextImage
                        alt=""
                        className={cn(
                          'absolute inset-0 size-full',
                          isSquarish(thumbnail) ? 'object-contain p-6' : 'object-cover',
                        )}
                        height={THUMBNAIL_SIZE.height}
                        src={thumbnail.src}
                        width={THUMBNAIL_SIZE.width}
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
