import React from 'react'

import { cachedTodayInFrance } from '@/utilities/parisDay'

import { AgendaMonth } from './AgendaMonth'
import { getAgendaEvents } from './getAgendaEvents'
import { groupEventsByMonth } from './groupEvents'

/**
 * The whole upcoming programme, a section per month, with all but the first few
 * days of each month behind a disclosure so the page stays scannable.
 *
 * This is the only place the agenda appears — there is no separate programme
 * page, same as the site it replaces — so `/activities` links here by anchor.
 */
export async function HomeAgenda() {
  /* Read once and handed to both, so the day the query filtered on and the day
   * the grouping cuts at cannot disagree across a midnight. */
  const today = await cachedTodayInFrance()
  const months = groupEventsByMonth(await getAgendaEvents(today), { from: today })

  return (
    <section className="container scroll-mt-24 py-16 md:py-24" id="agenda">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Agenda</h2>
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
          Sauf modification du parcours pendant la randonnée (cela peut arriver !), les km et D+
          (somme de toutes les montées du parcours) annoncés sont ceux calculés et indiqués par
          l’application Visorando, utilisée par la majorité des animateurs.
        </p>
      </div>

      {months.length === 0 ? (
        <p className="text-muted-foreground mt-12 text-center">
          Aucun événement n’est programmé pour le moment.
        </p>
      ) : (
        <div className="mt-12 flex flex-col gap-16">
          {months.map((month) => (
            <AgendaMonth key={month.month} previewDays={3} {...month} />
          ))}
        </div>
      )}
    </section>
  )
}
