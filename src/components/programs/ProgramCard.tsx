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
 * chevron frozen. So the surface comes up a step instead, the title underlines,
 * and the chevron — the one part of the card whose whole job is to say there is
 * somewhere to go — darkens and shifts a little towards where it points.
 *
 * The border *leaves* as the shadow arrives, rather than turning green as it
 * first did here. A border and a shadow say the same thing — this is where the
 * object ends — and a card wearing both at once reads as an outlined chip
 * rather than a lifted surface; a thing that lifts loses its hard contact line.
 * The numbers agree: at rest the border is 1.29:1 against its own fill, a
 * whisper, where a green edge on the raised white was 1.71:1 — the outline
 * getting half again louder at the moment the fill turns the most delicate
 * colour on the page, which is the opposite of what the hover is for. Nothing
 * is lost by dropping it: the background paints under the border box, so the
 * card's own colour runs to the outer edge with no gap and no reflow.
 *
 * `shadow-sm` rather than the `shadow-xs` the controls wear, because with the
 * outline gone the shadow is the only thing drawing the card's edge — and on
 * `/programs`, where the ground is the plain cream, the raised white is 1.04:1
 * against it and a 5% shadow left the card looking dissolved rather than
 * lifted. It is two rungs above the resting `Card`, which is the point: that
 * one is a region of the page at rest, this one is a surface answering a
 * cursor, and it goes back down the moment the cursor leaves.
 *
 * Which step it comes up is per theme, because the step is not the same token
 * in both. In light, `card` is white against a cream page — up. In dark, `card`
 * is L 0.215 and the `bg-muted/40` band it sits in resolves to L 0.218, so
 * `card` is not a step at all: the two are the same colour and the hover would
 * vanish once the border stops carrying it. `muted` is the step there, 1.18:1
 * over that band and 1.29:1 on a plain page.
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
      className="[a]:hover:bg-card dark:[a]:hover:bg-muted [a]:transition-[background-color,border-color,box-shadow] hover:border-transparent hover:shadow-sm"
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
