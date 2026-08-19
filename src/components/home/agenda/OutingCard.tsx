import React from 'react'

import type { AgendaOuting } from './groupOutings'

import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'

/** Splits on URLs while keeping them, so `split` hands back the links too. */
const urlPattern = /(https?:\/\/\S+)/g

const isUrl = (value: string) => /^https?:\/\//.test(value)

/**
 * The club writes the meeting point and the practical details as free text, one
 * item per line, with bare URLs for the departure point. Lines are kept as
 * written; the URLs become links rather than something to copy by hand.
 */
function OutingDetails({ content }: { content: string }) {
  return (
    <div className="text-muted-foreground space-y-0.5 text-sm">
      {content.split('\n').map((line, i) => (
        <p className="wrap-anywhere" key={i}>
          {line.split(urlPattern).map((part, j) =>
            isUrl(part) ? (
              <a
                className="underline underline-offset-4 hover:text-primary"
                href={part}
                key={j}
                rel="noreferrer"
                target="_blank"
              >
                {part}
              </a>
            ) : (
              part
            ),
          )}
        </p>
      ))}
    </div>
  )
}

/**
 * A single outing: departure and return times down the leading column, then the
 * kind of walk, where to meet and who is leading it.
 */
export function OutingCard({ author, content, endTime, startTime, title }: AgendaOuting) {
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
        <OutingDetails content={content} />
        {author && (
          <ItemDescription className="line-clamp-none">Animé par {author}</ItemDescription>
        )}
      </ItemContent>
    </Item>
  )
}
