import React from 'react'

import type { RegistrationStatus as Status } from './registrationStatus'

import { CalendarClockIcon } from 'lucide-react'
import { cn } from '@/components/ui'
import { formatDeadline } from './formatSchedule'

/**
 * « Complet », « Inscriptions closes », or the day they close.
 *
 * The two that mean *you have missed this one* are set as a badge, because they
 * are the exception a reader scanning the list needs to catch without reading
 * the line. A deadline still to come is ordinary — most entries carry one — so
 * it is not badged, which would cost the other two their prominence.
 *
 * It still has to be found, though. Set as plain muted text it landed between
 * the date above it and the summary below in the same size and the same grey,
 * and read as a third line of prose rather than as the one date on the card
 * with something to do — it was skimmed past even by someone looking for it.
 *
 * So all three are pills, and the weight is what separates them: a deadline
 * still to come is an outline, the two that mean « too late » are filled. The
 * shape says « this is the state of the thing » at a glance, and the fill is
 * what still makes the exceptions the ones the eye lands on.
 *
 * All three sit in the same slot under the date, so the eye finds them in one
 * place whichever it is.
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

  if (status.kind === 'open')
    return (
      <span
        className={cn(
          'text-foreground ring-border inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
          className,
        )}
      >
        <CalendarClockIcon aria-hidden="true" className="size-3 shrink-0" />
        Inscriptions jusqu’au {formatDeadline(status.deadline, startDate)}
      </span>
    )

  return (
    <span
      className={cn(
        'bg-muted text-muted-foreground ring-border w-fit rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        className,
      )}
    >
      {status.kind === 'full' ? 'Complet' : 'Inscriptions closes'}
    </span>
  )
}
