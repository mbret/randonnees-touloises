import React from 'react'

import type { AgendaDay, AgendaMonth as AgendaMonthType } from './groupEvents'

import { ItemGroup } from '@/components/ui/item'
import { cn } from '@/components/ui'
import { EventCard } from './EventCard'
import { groupDaysByWeek } from './groupEvents'

function AgendaDayGroup({ date, label, events }: AgendaDay) {
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
        {events.map((event, i) => (
          <EventCard key={i} {...event} />
        ))}
      </ItemGroup>
    </div>
  )
}

/**
 * One month of the programme, listed in full: every day it holds, with the
 * weeks as landmarks between the day headings.
 *
 * The month used to cap itself at three days with the rest behind a
 * disclosure, because every month was on the page at once. The tabs above now
 * show one month at a time, and a reader who picked « Septembre » asked for
 * September — not for its first three days. What keeps its nineteen day
 * headings scannable instead is the week line every four or five of them; a
 * month whose days all fit inside one week doesn't print it, because a
 * landmark on a path of two steps is noise.
 *
 * The heading is for screen readers and anchors only: the tab that opened
 * this panel already says the month's name, and repeating it in display type
 * directly underneath would be the same word twice in a row.
 */
export function AgendaMonth({ days, label, month }: AgendaMonthType) {
  const weeks = groupDaysByWeek(days)

  return (
    <section aria-labelledby={`agenda-${month}`}>
      <h3 className="sr-only scroll-mt-24" id={`agenda-${month}`}>
        {label}
      </h3>

      <div className="flex flex-col gap-10">
        {weeks.map((week) => (
          <div key={week.start}>
            {weeks.length > 1 && (
              <p className="font-display text-primary text-xs font-semibold tracking-widest uppercase">
                {week.label}
              </p>
            )}
            <div className={cn('flex flex-col gap-8', weeks.length > 1 && 'mt-4')}>
              {week.days.map((day) => (
                <AgendaDayGroup key={day.date} {...day} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
