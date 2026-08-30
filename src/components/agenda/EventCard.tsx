import React from 'react'

import type { AgendaEvent } from './groupEvents'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { cn } from '@/components/ui'

/**
 * A single event: the club's pictogram and the departure and return times down
 * the leading column, then the kind of walk and the details as the editor laid
 * them out — meeting point, animateur, distance and so on all live in that rich
 * text rather than in fields of their own, so the card imposes no order on them.
 *
 * The logo goes in the leading column rather than beside the name because that
 * column is already a fixed `w-14`: the tile costs the details not a pixel of
 * width, which is what it would cost in a column of its own. And a day is read
 * down that edge — orange, blue, orange — the way the printed programme is
 * read, which is exactly what a pictogram beside the name cannot do.
 *
 * A walk with no category simply has no tile. Nothing stands in for it: a grey
 * square in that space reads as an image that failed to load, where an absence
 * reads as what it is.
 *
 * The details deliberately opt out of `prose`: it caps its width at 65ch and
 * centres what is left, which indents the text away from the title, and it sizes
 * headings for an article rather than a card. The few marks that survive in this
 * space are styled here instead.
 */
export function EventCard({ content, endTime, logo, startTime, title }: AgendaEvent) {
  return (
    <Item variant="outline">
      {(logo || startTime) && (
        <ItemMedia className="w-14 flex-col items-start gap-2">
          {logo && (
            /* The alt text comes from the media record and is empty there on
             * purpose: the category's name is printed beside the tile, so a
             * screen reader that announced the image would say « Grande »
             * twice. The tile is decoration for a name already given. */
            <Media htmlElement={null} imgClassName="size-10" resource={logo} size="40px" />
          )}
          {startTime && (
            <div className="flex flex-col font-mono text-sm font-medium tabular-nums">
              <time>{startTime}</time>
              {endTime && <time className="text-muted-foreground font-normal">{endTime}</time>}
            </div>
          )}
        </ItemMedia>
      )}
      <ItemContent>
        {title && <ItemTitle className="text-base">{title}</ItemTitle>}
        {content && (
          <RichText
            className={cn(
              'text-muted-foreground space-y-1 text-sm',
              '[&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary',
              '[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5',
              '[&_:is(h1,h2,h3,h4)]:text-foreground [&_:is(h1,h2,h3,h4)]:font-semibold',
            )}
            data={content}
            enableGutter={false}
            enableProse={false}
          />
        )}
      </ItemContent>
    </Item>
  )
}
