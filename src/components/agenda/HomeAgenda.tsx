import React from 'react'

import { AgendaMonth } from './AgendaMonth'
import { AgendaMonthTabs } from './AgendaMonthTabs'
import { getAgendaEvents } from './getAgendaEvents'
import { groupEventsByMonth } from './groupEvents'

/**
 * The upcoming programme, one month on show at a time.
 *
 * The club publishes some six weeks ahead, so there are rarely more than two
 * months here — but laid end to end they were a long, samey scroll, and the
 * home page has sections below this one. The tabs bound the section's height;
 * the months they choose between are all server-rendered into the HTML, the
 * inactive ones merely `hidden`, so nothing is lost to crawlers or to the
 * browser's own page search. The tab row is the section's only client state.
 *
 * This is the only place the agenda appears — there is no separate programme
 * page, same as the site it replaces — so `/activities` links here by anchor.
 */
export async function HomeAgenda() {
  const months = groupEventsByMonth(await getAgendaEvents())

  return (
    <section className="container scroll-mt-24 py-16 md:py-24" id="agenda">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Nos sorties du mois</h2>
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
        <div className="mt-10">
          <AgendaMonthTabs
            months={months.map((month) => ({
              month: month.month,
              label: month.label,
              count: month.days.reduce((total, day) => total + day.events.length, 0),
            }))}
          >
            {months.map((month) => (
              <AgendaMonth key={month.month} {...month} />
            ))}
          </AgendaMonthTabs>
        </div>
      )}
    </section>
  )
}
