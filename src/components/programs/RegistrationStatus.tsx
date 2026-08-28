import React from 'react'

import type { RegistrationStatus as Status } from './registrationStatus'

import { CalendarClockIcon, CalendarOffIcon } from 'lucide-react'
import { cn } from '@/components/ui'
import { formatDeadline } from './formatSchedule'

/**
 * What the club has said about signing up, as pills under the date.
 *
 * A pill rather than a line of text because the eye finds a shape before it
 * reads a word: set as prose, the one date on the card with something to do sat
 * between the date above it and the summary below in the same grey, and was
 * skimmed past even by someone looking for it.
 *
 * Two of them, when there are two things to say. The deadline keeps its own
 * pill whether or not it has passed — a struck calendar and « closes » are the
 * whole difference — so an outing that fills up early still shows the date it
 * closes on, and one that closed on time still says when. « Complet » sits
 * beside it rather than replacing it.
 *
 * The fill is what ranks them: the deadline is an outline either way, and
 * « Complet » is filled, so the exception is still what the eye lands on.
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

  const { deadline, full } = status

  return (
    <span className={cn('flex flex-wrap items-center gap-2', className)}>
      {deadline && (
        <span
          className={cn(
            'ring-border inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
            deadline.closed ? 'text-muted-foreground' : 'text-foreground',
          )}
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

      {full && (
        <span className="bg-muted text-foreground ring-border w-fit rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset">
          Complet
        </span>
      )}
    </span>
  )
}
