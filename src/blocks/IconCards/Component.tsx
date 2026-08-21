import type { LucideIcon } from 'lucide-react'
import React from 'react'

import {
  Calendar,
  Compass,
  Footprints,
  HeartHandshake,
  Map,
  Mountain,
  Shield,
  Users,
} from 'lucide-react'

import type { IconCardsBlock as IconCardsBlockProps } from '@/payload-types'

import { Card, CardContent } from '@/components/ui/card'
import { Media } from '@/components/Media'

import type { CardIcon } from './icons'

/**
 * Typed against `CardIcon`, so adding a name to `cardIconLabels` without an
 * icon here is a build error rather than a card that renders blank.
 */
const icons: Record<CardIcon, LucideIcon> = {
  calendar: Calendar,
  compass: Compass,
  footprints: Footprints,
  handshake: HeartHandshake,
  map: Map,
  mountain: Mountain,
  shield: Shield,
  users: Users,
}

/**
 * Paired with an illustration, the cards take the wider column and the image
 * the narrower one — a portrait poster given the full container is the ~1000px
 * slab that pushes everything below it off the screen.
 *
 * The image comes first on mobile, where the columns collapse: it is the thing
 * that says what the section is about.
 */
const layouts = {
  left: { grid: 'lg:grid-cols-[2fr_3fr]', cards: 'order-2', media: 'order-1' },
  right: {
    grid: 'lg:grid-cols-[3fr_2fr]',
    cards: 'order-2 lg:order-1',
    media: 'order-1 lg:order-2',
  },
} as const

export const IconCardsBlock: React.FC<IconCardsBlockProps> = ({ cards, media, mediaPosition }) => {
  if (!cards?.length) return null

  const list = (
    <div className="grid gap-4">
      {cards.map(({ description, icon, id, title }) => {
        const Icon = icons[icon]

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

        <Media
          className={layout.media}
          imgClassName="rounded-lg w-full h-auto"
          resource={media}
          size="(max-width: 1024px) 100vw, 40vw"
        />
      </div>
    </div>
  )
}
