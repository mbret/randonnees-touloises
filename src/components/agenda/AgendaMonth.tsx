import React from 'react'

import type { AgendaDay, AgendaMonth as AgendaMonthType } from './groupOutings'

import { ChevronDownIcon } from 'lucide-react'
import { ItemGroup } from '@/components/ui/item'
import { OutingCard } from './OutingCard'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/components/ui'

function AgendaDayGroup({ date, label, outings }: AgendaDay) {
  return (
    <div>
      {/* The ids are anchor targets, so the heading clears the sticky header. */}
      <h4
        className="text-muted-foreground scroll-mt-24 border-b pb-2 text-sm font-semibold tracking-wide uppercase"
        id={`agenda-${date}`}
      >
        {label}
      </h4>
      <ItemGroup className="mt-3 gap-3">
        {outings.map((outing, i) => (
          <OutingCard key={i} {...outing} />
        ))}
      </ItemGroup>
    </div>
  )
}

/**
 * One month of the programme: a heading, then every day it holds with its
 * outings underneath.
 *
 * The current site puts the days behind a filter and shows one at a time, which
 * hides most of the month behind a click and leaves nothing for search engines.
 * The whole month is listed instead, which also means no client state.
 *
 * `previewDays` caps how many days are on show before the rest go behind a
 * disclosure; leaving it out lists the month in full. The overflow is a plain
 * `<details>` rather than a toggle in React: the days are in the HTML either
 * way — so still crawlable and still findable with the browser's own search —
 * and the section stays free of client-side state.
 */
export function AgendaMonth({
  days,
  label,
  month,
  previewDays,
}: AgendaMonthType & { previewDays?: number }) {
  const shown = previewDays === undefined ? days : days.slice(0, previewDays)
  const hidden = previewDays === undefined ? [] : days.slice(previewDays)

  return (
    <section aria-labelledby={`agenda-${month}`}>
      <h3 className="scroll-mt-24 text-2xl font-semibold tracking-tight" id={`agenda-${month}`}>
        {label}
      </h3>

      <div className="mt-6 flex flex-col gap-8">
        {shown.map((day) => (
          <AgendaDayGroup key={day.date} {...day} />
        ))}

        {hidden.length > 0 && (
          <details className="group">
            <summary
              className={cn(
                /* Ghost, not outline: the cards around it are already bordered. */
                buttonVariants({ variant: 'ghost' }),
                'w-full cursor-pointer list-none [&::-webkit-details-marker]:hidden',
              )}
            >
              <span className="group-open:hidden">
                Voir{' '}
                {hidden.length === 1 ? 'le jour suivant' : `les ${hidden.length} jours suivants`}
              </span>
              <span className="hidden group-open:inline">Réduire</span>
              <ChevronDownIcon className="transition-transform group-open:rotate-180" />
            </summary>

            <div className="mt-8 flex flex-col gap-8">
              {hidden.map((day) => (
                <AgendaDayGroup key={day.date} {...day} />
              ))}
            </div>
          </details>
        )}
      </div>
    </section>
  )
}
