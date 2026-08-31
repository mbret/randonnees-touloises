'use client'

import React, { useEffect, useRef, useState } from 'react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/components/ui'

export type AgendaTabMonth = {
  /** 'YYYY-MM', matching the ids `AgendaMonth` gives its anchors. */
  month: string
  /** 'Septembre 2026' */
  label: string
  /** How many outings the month holds, printed on the tab. */
  count: number
}

/** 'Septembre 2026 — 30 sorties', for the tab's accessible name. */
const describe = ({ count, label }: AgendaTabMonth) =>
  `${label} — ${count} ${count > 1 ? 'sorties' : 'sortie'}`

/**
 * The row of month tabs over the agenda, and the switch showing one month at
 * a time.
 *
 * The months arrive fully rendered from the server as `children`, one per
 * entry of `months`, and every one of them stays in the HTML whichever tab is
 * active — the others are merely `hidden`. Crawlers and the browser's own
 * page search still see the whole programme, and without JavaScript the page
 * degrades to the first month rather than to nothing.
 *
 * That first month is selected on the server, so the page arrives already
 * showing it, and it is the right default by construction: past days never
 * reach the agenda, so the first month is wherever the next outing is —
 * today's month, or the next one once today's is spent. No rule about
 * "current month" to get wrong on the 30th of one.
 *
 * `#agenda-2026-09` — or a day inside it, `#agenda-2026-09-12` — selects its
 * month on arrival, and picking a tab writes the month back into the URL, so
 * a copied link opens on the month it was copied from. `replaceState` rather
 * than a navigation: the back button should leave the page, not replay every
 * tab.
 */
export function AgendaMonthTabs({
  children,
  months,
}: {
  children: React.ReactNode
  months: AgendaTabMonth[]
}) {
  const [selected, setSelected] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  /** A scroll owed to the fragment, held until its month's panel is on show. */
  const owed = useRef<{ id: string; index: number } | null>(null)
  const panels = React.Children.toArray(children)

  /* A lone month needs no chrome for choosing between one thing — and with no
   * tablist rendered, panel roles would point at tabs that don't exist. */
  const tabbed = months.length > 1

  /*
   * Seeding state from an effect is the point here, not an oversight, so the
   * rule against it is suppressed rather than obeyed: the fragment is not
   * known to the server — it never leaves the browser — and rendering from it
   * would hydrate mismatched against HTML that always shows the first month.
   * After hydration is also exactly when acting on it becomes possible.
   */
  useEffect(() => {
    const hash = window.location.hash
    const target = /^#agenda-(\d{4}-\d{2})/.exec(hash)?.[1]
    const index = months.findIndex((entry) => entry.month === target)

    if (index === -1) return

    owed.current = { id: hash.slice(1), index }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(index)
  }, [months])

  /*
   * The browser already tried the fragment against a hidden element and gave
   * up, so the scroll it owed is re-run here — and only once the selection
   * has actually committed, which is what the index comparison waits for: an
   * element still inside a `hidden` panel has no box to scroll to. When the
   * fragment names the month already on show, that is this same mount pass.
   */
  useEffect(() => {
    if (owed.current === null || owed.current.index !== selected) return

    document.getElementById(owed.current.id)?.scrollIntoView()
    owed.current = null
  }, [selected])

  const select = (index: number) => {
    setSelected(index)
    window.history.replaceState(null, '', `#agenda-${months[index].month}`)
    // On a phone the row scrolls; the picked tab is kept in reach.
    tabs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0

    if (step === 0) return

    event.preventDefault()
    const next = (selected + step + months.length) % months.length
    select(next)
    tabs.current[next]?.focus()
  }

  return (
    <div>
      {tabbed && (
        /* The bleed lets the row scroll to the viewport's edge on a phone
         * instead of clipping against the container's gutter. */
        <div className="-mx-4 overflow-x-auto px-4">
          <div
            aria-label="Choisir le mois"
            className="mx-auto flex w-max gap-2"
            onKeyDown={onKeyDown}
            role="tablist"
          >
            {months.map((entry, index) => (
              <button
                aria-controls={`agenda-panel-${entry.month}`}
                aria-label={describe(entry)}
                aria-selected={index === selected}
                className={cn(
                  buttonVariants({
                    size: 'sm',
                    variant: index === selected ? 'default' : 'outline',
                  }),
                  'rounded-full',
                )}
                id={`agenda-tab-${entry.month}`}
                key={entry.month}
                onClick={() => select(index)}
                ref={(node) => {
                  tabs.current[index] = node
                }}
                role="tab"
                tabIndex={index === selected ? 0 : -1}
                type="button"
              >
                {/* The year would repeat on every tab; the panel's own heading
                 * keeps the full label for anyone who needs it spelled out. */}
                {entry.label.replace(/\s+\d+$/, '')}
                <span className="font-mono text-xs font-normal tabular-nums opacity-75">
                  {entry.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={cn(tabbed && 'mt-10')}>
        {panels.map((panel, index) => {
          const entry = months[index]

          return (
            <div
              aria-labelledby={tabbed ? `agenda-tab-${entry.month}` : undefined}
              hidden={index !== selected}
              id={`agenda-panel-${entry.month}`}
              key={entry.month}
              role={tabbed ? 'tabpanel' : undefined}
            >
              {panel}
            </div>
          )
        })}
      </div>
    </div>
  )
}
