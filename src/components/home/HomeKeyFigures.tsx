import React from 'react'

import { HOME_FIGURES } from '@/data/keyFigures'

/**
 * The club stated in four numbers, directly under the hero.
 *
 * A band rather than cards: the figures are one claim made four ways — how many
 * of us, how far, how many of us take the others out, where that puts the club —
 * and boxing each one separately would break a single sentence into four.
 *
 * The numbers take the display face and the club's orange, which until now had
 * no job on the page beyond the focus ring.
 */
export function HomeKeyFigures() {
  return (
    <section aria-label="Le club en chiffres" className="border-border border-b">
      <div className="container grid grid-cols-2 gap-y-8 py-10 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-border">
        {HOME_FIGURES.map(({ label, suffix, value }) => (
          <div className="sm:px-6 sm:first:pl-0 sm:last:pr-0" key={label}>
            <p className="font-display text-brand-orange text-3xl leading-none font-bold sm:text-4xl">
              {value}
              {suffix && <sup className="align-super text-[0.5em]">{suffix}</sup>}
            </p>
            <p className="text-muted-foreground mt-3 text-sm leading-snug text-balance">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
