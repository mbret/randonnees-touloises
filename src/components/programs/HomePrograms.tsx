import Link from 'next/link'
import React from 'react'

import { buttonVariants } from '@/components/ui/button'
import { getPrograms } from './getPrograms'
import { ProgramList } from './ProgramList'

/** How many of the nearest entries the home page shows before the full list. */
const PREVIEW = 4

/**
 * The sorties à la journée, séjours and week-ends open to inscription, soonest
 * first — the club's « programme hebdomadaire », which is separate from the
 * agenda above it: the agenda lists the walks you turn up to, this lists the
 * outings you sign up for, and each of these has a page of its own.
 */
export async function HomePrograms() {
  const entries = await getPrograms({ limit: PREVIEW + 1 })
  const shown = entries.slice(0, PREVIEW)

  return (
    <section className="bg-muted/40 scroll-mt-24 py-16 md:py-24" id="programs">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Programme hebdomadaire</h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            Les sorties à la journée, les week-ends et les séjours ouverts aux inscriptions.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <ProgramList entries={shown} />

          {entries.length > shown.length && (
            <div className="mt-6 text-center">
              <Link className={buttonVariants({ variant: 'outline' })} href="/programs">
                Voir tout le programme
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
