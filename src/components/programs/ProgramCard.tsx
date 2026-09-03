import Link from 'next/link'
import React from 'react'

import type { ProgramEntry } from './getPrograms'

import { ChevronRightIcon } from 'lucide-react'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { formatBadge, formatSchedule } from './formatSchedule'
import { PROGRAMS_BASE } from '@/utilities/postPath'
import { RegistrationStatus } from './RegistrationStatus'
import { registrationStatus } from './registrationStatus'

/**
 * One programme entry: the day down the leading column, then what it is and when,
 * mirroring the agenda's cards so the two sections read as one page.
 *
 * The whole card is the link rather than a « en savoir plus » at the end of it —
 * every entry has a page, and that page is the only thing the card is for.
 *
 * Which is why hovering lifts the card instead of tinting it. `Item` ships a
 * `bg-accent/50` wash that repaints the fill and nothing else: over the
 * `bg-muted/40` the home page sits these cards on, that wash is 1.03:1, and
 * almost none of it is lightness — the hue turns 33° into the pale lime while
 * the value stays put, which reads as a card that has been « marked » rather
 * than one answering the cursor, and leaves the border, the title and the
 * chevron frozen. The card colour is 1.09:1 on that same ground and stays on the
 * paper's hue, so the interior becomes the actual card, the edge takes the
 * club's green at the strength the outline button already hovers to, and the
 * chevron — the one part of the card whose whole job is to say there is
 * somewhere to go — darkens and shifts a little towards it.
 *
 * `[a]:` on the background because that is the variant `itemVariants` sets its
 * own hover under: the arbitrary variant outranks a plain `hover:bg-*`, and
 * tailwind-merge matches on the variant set, so a plain one would be kept
 * alongside it and then lose on specificity. The transition is respelled under
 * the same variant for the same reason — `transition-colors` there would leave
 * the shadow to snap in.
 */
export function ProgramCard({
  availability,
  endDate,
  openToAll,
  registrationDeadline,
  slug,
  startDate,
  summary,
  title,
}: ProgramEntry) {
  const badge = formatBadge(startDate)
  const status = registrationStatus({
    availability,
    deadline: registrationDeadline,
    openToAll,
  })

  return (
    <Item
      asChild
      className="[a]:hover:bg-card [a]:transition-[background-color,border-color,box-shadow] hover:border-brand-green/40 hover:shadow-xs"
      variant="outline"
    >
      <Link href={`${PROGRAMS_BASE}/${slug}`}>
        <ItemMedia className="w-14 flex-col items-start gap-0 tabular-nums">
          <span className="font-mono text-lg leading-none font-semibold">{badge.day}</span>
          <span className="text-muted-foreground text-sm">{badge.month}</span>
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="text-base underline-offset-4 group-hover/item:underline">
            {title}
          </ItemTitle>
          <ItemDescription className="line-clamp-none">
            {formatSchedule(startDate, endDate)}
          </ItemDescription>
          <RegistrationStatus startDate={startDate} status={status} />
          {summary && <ItemDescription className="line-clamp-2">{summary}</ItemDescription>}
        </ItemContent>
        <ItemActions>
          {/* `motion-safe:` on the shift alone: the darkening is a fade rather
           * than motion, and it is what carries the cue when the shift is off. */}
          <ChevronRightIcon className="text-muted-foreground size-4 transition-[color,transform] group-hover/item:text-foreground motion-safe:group-hover/item:translate-x-0.5" />
        </ItemActions>
      </Link>
    </Item>
  )
}
