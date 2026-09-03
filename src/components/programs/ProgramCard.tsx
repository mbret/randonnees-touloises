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
 * built on the agenda's card so the two sections read as one page — the same
 * geometry, the same `w-14` day column, the same rhythm down the list.
 *
 * The same geometry, but not the same surface, and that is deliberate. The
 * whole card is the link rather than a « en savoir plus » at the end of it —
 * every entry has a page, and that page is the only thing the card is for —
 * while the agenda's cards are inert: text an editor typed, with nowhere to go.
 * Sharing the outline exactly, as this did, made those two things
 * indistinguishable until the cursor was already on one of them, so the
 * clickable one has a fill of its own. `bg-card` says there is an object here;
 * the agenda's bare outline says there is a block of text here. It is the one
 * cue that is there before the cursor is.
 *
 * That fill is also what makes the hover work at all, and it is why the wash
 * `Item` already ships is the right one after all. `[a]:hover:bg-accent/50`
 * over a *transparent* card on the home page's `bg-muted/40` band is 1.03:1,
 * which this file long read as the wash being wrong. The wash was never wrong;
 * washing nothing was. With `bg-card` beneath it the same token at full
 * strength is a real step — 1.17:1 in light, 1.31:1 in dark — and it is the
 * hover the rest of the site already answers with: outline buttons, ghost
 * buttons, the nav. A card that is a link hovers like everything else that is.
 *
 * Nothing grows. The border is the same 1 px at rest and hovered, no shadow
 * arrives, and only the fill moves. Two attempts here got that wrong from
 * opposite ends. `hover:shadow-sm` over `hover:border-transparent` lifted the
 * card off the page, and every shadow in the scale is cast downwards —
 * `shadow-sm` is 1 px down under 3 px of blur — so the flanks and the foot of
 * the card got an edge and the head of it got none: raised white meeting the
 * ground at 1.04:1 on `/programs`, a card that read as having come apart along
 * the top. Then a step to `input` drew all four edges evenly and still grew,
 * which was the half of the fault that had nothing to do with the shadow. An
 * edge that thickens under the cursor reads as the card acquiring an outline
 * rather than as the card answering, and it is worst over a pale fill, where
 * the interior says *lifted* and the edge says *outlined chip*.
 *
 * Dark takes `input` for that border instead of `border` — at rest and hovered
 * alike, so it is a value the card wears rather than a step it takes. On
 * `/programs` a `card` fill is 1.30:1 above the page and the rim is most of
 * what draws the object; and a rim *lighter* than the fill it encloses reads as
 * light catching an edge, where the same move in light can only be a darker
 * line drawn around one. It is the edge the outline button already wears in
 * dark (`dark:border-input`), for the same reason.
 *
 * `[a]:` on the background because that is the variant `itemVariants` sets its
 * own hover under: the arbitrary variant outranks a plain `hover:bg-*`, and
 * tailwind-merge matches on the variant set, so a plain one would be kept
 * alongside it and then lose on specificity. Spelled the same way, it collapses
 * the shipped `/50` instead of racing it — same modifier set, same class group,
 * ours last. Nothing needs a transition spelled out here: with only the fill
 * moving, the base `transition-colors` carries it.
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
    <Item asChild className="bg-card [a]:hover:bg-accent dark:border-input" variant="outline">
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
