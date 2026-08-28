import React from 'react'

import type { RegistrationStatus as Status } from './registrationStatus'

import { cn } from '@/components/ui'
import { formatDeadline } from './formatSchedule'

/**
 * « Complet », « Inscriptions closes », or the day they close.
 *
 * The two that mean *you have missed this one* are set as a badge, because they
 * are the exception a reader scanning the list needs to catch without reading
 * the line. A deadline still to come is ordinary information — most entries
 * carry one — so it stays as text, where a badge on every card would say
 * nothing and cost the two that matter their prominence.
 *
 * Both sit in the same slot under the date, so the eye finds them in one place
 * whichever it is.
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
      <span className={cn('text-muted-foreground text-sm', className)}>
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
