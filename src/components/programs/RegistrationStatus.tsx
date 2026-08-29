import React from 'react'

import type { RegistrationStatus as Status } from './registrationStatus'

import { CalendarClockIcon, CalendarOffIcon, UsersIcon } from 'lucide-react'
import { cn } from '@/components/ui'
import { formatDeadline } from './formatSchedule'

const PILL = 'inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium'
const OUTLINE = `${PILL} ring-border ring-1 ring-inset`
const FILLED = `${PILL} bg-muted text-foreground ring-border ring-1 ring-inset`

/**
 * What the club has said about joining, as pills under the date.
 *
 * A pill rather than a line of text because the eye finds a shape before it
 * reads a word: set as prose, the one date on the card with something to do sat
 * between the date above it and the summary below in the same grey, and was
 * skimmed past even by someone looking for it.
 *
 * As many as there are things to say, in the order a reader wants them: what
 * you can still do about it, then who it is for. The deadline keeps its own
 * pill whether or not it has passed — a struck calendar and « closes » are the
 * whole difference — so an outing that fills up early still shows the date it
 * closes on.
 *
 * The fill ranks them. Filled is a place you cannot simply take: « Complet »,
 * or a waiting list, which is the same news with something left to do about it.
 * The deadline is an outline either way. « Ouverte à tous » is an outline too,
 * because it is good news rather than an obstacle — but it is not muted, since
 * the people it is addressed to are the ones not yet in the club.
 */
export function RegistrationStatus({
  className,
  startDate,
  status,
}: {
  className?: string
  /** The outing's own day, so a same-year deadline can drop the year. */
  startDate?: string
  status: Status | null
}) {
  if (!status) return null

  const { deadline, openToAll, places } = status

  return (
    <span className={cn('flex flex-wrap items-center gap-2', className)}>
      {deadline && (
        <span
          className={cn(OUTLINE, deadline.closed ? 'text-muted-foreground' : 'text-foreground')}
        >
          {deadline.closed ? (
            <CalendarOffIcon aria-hidden="true" className="size-3 shrink-0" />
          ) : (
            <CalendarClockIcon aria-hidden="true" className="size-3 shrink-0" />
          )}
          {deadline.closed
            ? `Inscriptions closes le ${formatDeadline(deadline.day, startDate)}`
            : `Inscriptions jusqu’au ${formatDeadline(deadline.day, startDate)}`}
        </span>
      )}

      {places && (
        <span className={FILLED}>{places === 'full' ? 'Complet' : 'Liste d’attente'}</span>
      )}

      {openToAll && (
        <span className={cn(OUTLINE, 'text-foreground')}>
          <UsersIcon aria-hidden="true" className="size-3 shrink-0" />
          Ouverte à tous
        </span>
      )}
    </span>
  )
}
