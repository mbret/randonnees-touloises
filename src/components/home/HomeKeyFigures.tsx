import React from 'react'

import { HOME_FIGURES, KEY_FIGURES } from '@/data/keyFigures'

/**
 * A number as the band and the sentence both set it: the club's orange, in the
 * display face, and never broken across a line.
 */
function Figure({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-display text-brand-orange font-bold whitespace-nowrap">{children}</span>
  )
}

/**
 * The club stated in four numbers, directly under the hero.
 *
 * Written twice on purpose, once for each thing it has to be, with only one of
 * the two ever rendered. The alternative — one markup bent into both shapes —
 * needed a short label and a join flag stored beside each figure, which put the
 * wording of a sentence into a data file and still read worse than either shape
 * written plainly. Nothing is duplicated that matters: the numbers come from
 * `keyFigures.ts` in both, so they cannot drift, and `display: none` keeps the
 * unused shape out of the accessibility tree.
 *
 * From `sm` up it is a band: four cells divided by rules that run its full
 * height, from the hero's edge down to the bottom rule. Its padding steps with
 * the figures rather than staying put: below `lg` the number drops to `text-3xl`
 * and a cell built for the larger one is then mostly air, which reads as a gap
 * in the page rather than as a smaller band. The figures are one
 * claim made four ways, and boxing each separately would break a single
 * sentence into four.
 *
 * On a phone it becomes that sentence outright. Stacked as a band it cost 232px
 * of the first screen — 232px of scrolling before the agenda, which is what
 * most visitors came for. Said as a sentence it costs 77px. The last two are
 * joined rather than separated because they are the same season counted two
 * ways, which also lets the year be said once.
 */
export function HomeKeyFigures() {
  return (
    <section aria-label="Le club en chiffres" className="border-border border-b">
      <p className="text-muted-foreground container py-3.5 text-sm leading-relaxed sm:hidden">
        <Figure>{KEY_FIGURES.members.value}</Figure> adhérents{' '}
        <span aria-hidden className="text-border mx-1">
          ·
        </span>{' '}
        <Figure>{KEY_FIGURES.leaders.value}</Figure> animateurs{' '}
        <span aria-hidden className="text-border mx-1">
          ·
        </span>{' '}
        <Figure>{KEY_FIGURES.outings.value}</Figure> randonnées &amp;{' '}
        <Figure>{KEY_FIGURES.kilometres.value}</Figure> km en 2025
      </p>

      <div className="container hidden sm:grid sm:grid-cols-4 sm:divide-x sm:divide-border">
        {HOME_FIGURES.map(({ label, value }) => (
          <p className="px-4 py-6 first:pl-0 last:pr-0 lg:px-6 lg:py-10" key={label}>
            <Figure>
              <span className="block text-3xl leading-none lg:text-4xl">{value}</span>
            </Figure>
            <span className="text-muted-foreground mt-2 block text-sm leading-snug text-balance lg:mt-3">
              {label}
            </span>
          </p>
        ))}
      </div>
    </section>
  )
}
