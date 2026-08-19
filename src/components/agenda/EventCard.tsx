import React from 'react'

import type { AgendaEvent } from './groupEvents'

import RichText from '@/components/RichText'
import { Item, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { cn } from '@/components/ui'

/**
 * A single event: departure and return times down the leading column, then the
 * kind of walk and the details as the editor laid them out — meeting point,
 * animateur, distance and so on all live in that rich text rather than in fields
 * of their own, so the card imposes no order on them.
 *
 * The details deliberately opt out of `prose`: it caps its width at 65ch and
 * centres what is left, which indents the text away from the title, and it sizes
 * headings for an article rather than a card. The few marks that survive in this
 * space are styled here instead.
 */
export function EventCard({ content, endTime, startTime, title }: AgendaEvent) {
  return (
    <Item variant="outline">
      {startTime && (
        <ItemMedia className="w-14 flex-col items-start gap-0 text-sm font-medium tabular-nums">
          <time>{startTime}</time>
          {endTime && <time className="text-muted-foreground font-normal">{endTime}</time>}
        </ItemMedia>
      )}
      <ItemContent>
        <ItemTitle className="text-base">{title}</ItemTitle>
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
