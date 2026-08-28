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
 */
export function ProgramCard({
  endDate,
  isFull,
  registrationDeadline,
  slug,
  startDate,
  summary,
  title,
}: ProgramEntry) {
  const badge = formatBadge(startDate)
  const status = registrationStatus({ deadline: registrationDeadline, isFull })

  return (
    <Item asChild variant="outline">
      <Link href={`${PROGRAMS_BASE}/${slug}`}>
        <ItemMedia className="w-14 flex-col items-start gap-0 tabular-nums">
          <span className="text-lg leading-none font-semibold">{badge.day}</span>
          <span className="text-muted-foreground text-sm">{badge.month}</span>
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="text-base">{title}</ItemTitle>
          <ItemDescription className="line-clamp-none">
            {formatSchedule(startDate, endDate)}
          </ItemDescription>
          <RegistrationStatus startDate={startDate} status={status} />
          {summary && <ItemDescription className="line-clamp-2">{summary}</ItemDescription>}
        </ItemContent>
        <ItemActions>
          <ChevronRightIcon className="text-muted-foreground size-4" />
        </ItemActions>
      </Link>
    </Item>
  )
}
