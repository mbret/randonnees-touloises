import React from 'react'

import { AgendaMonth } from './AgendaMonth'
import { agendaOutings } from '@/data/agenda'
import { groupOutingsByMonth } from './groupOutings'

/**
 * The programme of upcoming outings, one section per month.
 *
 * Reads the static list for now; swapping in a query on the `events` collection
 * only changes where `outings` comes from, since the grouping already works off
 * the plain outing shape.
 */
export function HomeAgenda() {
  const months = groupOutingsByMonth(agendaOutings)

  return (
    <section className="container py-16 md:py-24">
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
          Aucune sortie n’est programmée pour le moment.
        </p>
      ) : (
        <div className="mx-auto mt-12 flex max-w-3xl flex-col gap-16">
          {months.map((month) => (
            /* A few days per month here; the rest sit behind the disclosure so
               the home page stays scannable. */
            <AgendaMonth key={month.month} previewDays={3} {...month} />
          ))}
        </div>
      )}
    </section>
  )
}
