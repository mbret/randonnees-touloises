import React from 'react'

import type { AgendaDay, AgendaMonth as AgendaMonthType } from './groupEvents'

import { ChevronDownIcon } from 'lucide-react'
import { ItemGroup } from '@/components/ui/item'
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
 * One month of the programme, a disclosure per week: the week underway open,
 * the ones after it folded to a line each.
 *
 * The tabs above bound which month is on the page; the weeks bound how much
 * of it is unfolded. A September alone is nineteen day headings standing
 * between the visitor and the sections below — but the fold runs along the
 * same seams as the landmarks, so what a closed week withholds is written on
 * it: which days, how many sorties. Past days never reach the agenda, which
 * is what makes "the first week" the week underway with no reading of the
 * clock here.
 *
 * Plain `<details>` rather than a toggle in React: every day is in the HTML
 * either way — crawlable, findable with the browser's own search — and the
 * section takes no client state beyond the tab row. A shared link to a day
 * inside a folded week is the tabs' job: they open the enclosing
 * `<details>` before scrolling.
 *
 * A month whose days all fit in one week skips the chrome — one open fold
 * with nothing to close it against is a heading wearing a chevron for show.
 *
 * The month's own heading is for screen readers and anchors only: the tab
 * that opened this panel already says the month's name, and repeating it in
 * display type directly underneath would be the same word twice in a row.
 */
export function AgendaMonth({ days, label, month }: AgendaMonthType) {
  const weeks = groupDaysByWeek(days)

  return (
    <section aria-labelledby={`agenda-${month}`}>
      <h3 className="sr-only scroll-mt-24" id={`agenda-${month}`}>
        {label}
      </h3>

      {weeks.length === 1 ? (
        <div className="flex flex-col gap-8">
          {weeks[0].days.map((day) => (
            <AgendaDayGroup key={day.date} {...day} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {weeks.map((week, index) => {
            const outings = week.days.reduce((total, day) => total + day.events.length, 0)

            return (
              <details className="group details-slide" key={week.start} open={index === 0}>
                <summary className="flex cursor-pointer list-none items-baseline gap-3 border-b pb-2 [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-primary text-xs font-semibold tracking-widest uppercase">
                    {week.label}
                  </span>
                  <span className="text-muted-foreground font-mono text-xs whitespace-nowrap tabular-nums">
                    {outings} {outings > 1 ? 'sorties' : 'sortie'}
                  </span>
                  <ChevronDownIcon className="text-muted-foreground ml-auto size-4 self-center transition-transform group-open:rotate-180" />
                </summary>

                <div className="mt-4 flex flex-col gap-8">
                  {week.days.map((day) => (
                    <AgendaDayGroup key={day.date} {...day} />
                  ))}
                </div>
              </details>
            )
          })}
        </div>
      )}
    </section>
  )
}
