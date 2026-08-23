import React from 'react'

import type { IconCardsBlock as IconCardsBlockProps } from '@/payload-types'

import { Card, CardContent } from '@/components/ui/card'
import { Media } from '@/components/Media'

import { iconComponents } from './iconComponents'

/**
 * Paired with an illustration, the image takes two thirds of the row and the
 * cards the remaining third: the cards are short enough to read in a narrow
 * column, and the poster is the thing worth showing at a size where its own
 * text can be read.
 *
 * Two thirds, not the whole width: a portrait poster given the full container
 * is the ~1000px slab that pushes everything below it a screen down.
 *
 * The image comes first on mobile, where the columns collapse: it is the thing
 * that says what the section is about.
 */
const layouts = {
  left: { grid: 'lg:grid-cols-[2fr_1fr]', cards: 'order-2', media: 'order-1' },
  right: {
    grid: 'lg:grid-cols-[1fr_2fr]',
    cards: 'order-2 lg:order-1',
    media: 'order-1 lg:order-2',
  },
} as const

export const IconCardsBlock: React.FC<IconCardsBlockProps> = ({ cards, media, mediaPosition }) => {
  if (!cards?.length) return null

  /* Beside an illustration the cards sit in a third of the container, so they
   * stack; on their own they have the full width, and three short cards across
   * it read as the steps or the promises they are rather than as a list. The
   * column count is capped at three so a fourth card wraps under the first
   * instead of shrinking all of them past legibility. */
  const list = (
    <div className={`grid gap-4 ${media ? '' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
      {cards.map(({ description, icon, id, title }) => {
        const Icon = iconComponents[icon]

        return (
          <Card key={id ?? title}>
            <CardContent className="flex gap-4">
              {Icon && <Icon aria-hidden className="size-6 shrink-0 text-primary mt-1" />}
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-muted-foreground text-sm mt-1">{description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  if (!media) {
    return <div className="container">{list}</div>
  }

  const layout = layouts[mediaPosition === 'left' ? 'left' : 'right']

  return (
    <div className="container">
      <div className={`grid gap-12 items-center ${layout.grid}`}>
        <div className={layout.cards}>{list}</div>

        {/* A fixed width past `lg`, not a share of the viewport: `.container`
            caps at 64rem, so the column stops growing at 608px — 960px of
            content, less the 48px gap, two thirds of what is left — however
            wide the window gets. Asking for `66vw` would have a 1920px screen
            fetch a rendition twice the size of the space it lands in.

            Phrased as `min-width` to match the `lg` breakpoint the columns
            actually split on: a `max-width: 1024px` arm also matches at
            exactly 1024, where the split has already happened. */}
        <Media
          className={layout.media}
          imgClassName="rounded-lg w-full h-auto"
          resource={media}
          size="(min-width: 1024px) 608px, 100vw"
        />
      </div>
    </div>
  )
}
