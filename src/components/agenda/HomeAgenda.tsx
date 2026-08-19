import React from 'react'

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
  const months = groupEventsByMonth(await getAgendaEvents())

  return (
    <section className="container scroll-mt-24 py-16 md:py-24" id="agenda">
      <div className="mx-auto max-w-3xl text-center">
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
        <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-16">
          {months.map((month) => (
            <AgendaMonth key={month.month} previewDays={3} {...month} />
          ))}
        </div>
      )}
    </section>
  )
}
