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
 * Which is why hovering answers with the whole card rather than tinting it.
 * `Item` ships a `bg-accent/50` wash that repaints the fill and nothing else:
 * over the `bg-muted/40` the home page sits these cards on, that wash is
 * 1.03:1, and almost none of it is lightness — the hue turns 33° into the pale
 * lime while the value stays put, which reads as a card that has been
 * « marked » rather than one answering the cursor, and leaves the border, the
 * title and the chevron frozen. So the surface comes up a step instead, the
 * border firms up with it, the title underlines, and the chevron — the one part
 * of the card whose whole job is to say there is somewhere to go — darkens and
 * shifts a little towards where it points.
 *
 * The border stays and darkens rather than leaving in favour of a shadow, which
 * is what this did first: `hover:border-transparent hover:shadow-sm`, the card
 * lifting off the page instead of drawing itself. It failed at the top edge,
 * and it had to. Every shadow in the scale is cast downwards — `shadow-sm` is
 * 1 px down under 3 px of blur — so the flanks and the foot of the card get an
 * edge and the head of it gets none, and what is left up there is the raised
 * white meeting the ground at 1.04:1 on `/programs`, 1.09:1 in the home page's
 * band. Not a soft edge: no edge. The card read as having come apart along the
 * top rather than as a surface that had come up, and no amount of blur or
 * spread mends that without also hanging a halo above the card that nothing in
 * the scene casts.
 *
 * A border has no direction, which is the whole of why it wins here: one value,
 * four edges, and the head of the card drawn exactly as well as its foot.
 * `input` is the step it takes — the palette's other edge token, the darker one
 * a field wears so a form is findable. Against the fill it encloses it goes
 * 1.29:1 → 1.87:1 in light and 1.43:1 → 1.81:1 in dark: the same firming in
 * both, from a rule a reader has to look for to one that has closed around what
 * the cursor is on.
 *
 * Which step the surface comes up is per theme, because the step is not the
 * same token in both. In light, `card` is white against a cream page — up. In
 * dark, `card` is L 0.215 and the `bg-muted/40` band it sits in resolves to
 * L 0.218, so `card` is not a step at all: the two are the same colour, and the
 * border would be left carrying the hover alone. `muted` is the step there,
 * 1.18:1 over that band and 1.29:1 on a plain page.
 *
 * `[a]:` on the background because that is the variant `itemVariants` sets its
 * own hover under: the arbitrary variant outranks a plain `hover:bg-*`, and
 * tailwind-merge matches on the variant set, so a plain one would be kept
 * alongside it and then lose on specificity. The border needs none of that —
 * `outline` sets `border-border` flat, with no hover of its own to outrank —
 * and neither property needs a transition spelled out here now that there is no
 * shadow among them: the base `transition-colors` already carries both.
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
      className="[a]:hover:bg-card dark:[a]:hover:bg-muted hover:border-input"
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
