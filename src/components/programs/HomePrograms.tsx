import Link from 'next/link'
import React from 'react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/components/ui'
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
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Programme hebdomadaire</h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            Les sorties à la journée, les week-ends et les séjours ouverts aux inscriptions.
          </p>
        </div>

        <div className="mt-12">
          <ProgramList entries={shown} />

          {entries.length > shown.length && (
            <div className="mt-6 text-center">
              {/* On the cards' surface rather than the page's, which is what the
               * outline variant paints by default. Four white cards and then a
               * button an inch below them in the *nearly* same white — cream
               * against `card`, 1.04:1 apart, with a 5% shadow the cards do not
               * have — is the worst of the three available readings: a band that
               * plainly holds one material, a band that plainly holds two, or
               * this, where the eye keeps asking whether the difference means
               * something. It means nothing: both are things you click in the
               * same band. Dark had the same fault pointing the other way, the
               * button's `input/30` sitting a step *lighter* than the cards.
               *
               * Fixed here rather than in `buttonVariants`, because the default
               * is right where an outline button usually lives — on the page
               * itself, where matching the page is what makes it read as a
               * control cut into it rather than a chip laid on it. It is only
               * wrong beside cards. Whether the site wants outline buttons to be
               * card-coloured everywhere is a wider question than this band.
               *
               * Only the resting surface is matched. The hover stays the
               * button's own — the green edge included — because that hover is
               * shared with every outline button on the site, and this one has
               * no more claim on it than the others. */}
              <Link
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'bg-card shadow-none dark:bg-card',
                )}
                href="/programs"
              >
                Voir tout le programme
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
