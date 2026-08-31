import React from 'react'

import { HOME_FIGURES } from '@/data/keyFigures'

/**
 * The club stated in four numbers, directly under the hero.
 *
 * Two shapes, one for each thing the band has to be.
 *
 * From `sm` up it is a band: four cells divided by rules that run its full
 * height, from the hero's edge down to the bottom rule. The figures are one
 * claim made four ways — how many of us, how far, how many take the others out,
 * where that puts the club — and boxing each separately would break a single
 * sentence into four.
 *
 * On a phone it becomes exactly that sentence. Stacked as a band it cost 232px
 * of the first screen, which is 232px of scrolling before the agenda — the
 * thing most visitors came for. Set as one run of text it costs 74px, and the
 * figures still read as figures because the numbers keep the display face and
 * the club's orange. The labels shorten to the way you would say them aloud,
 * since « 260 Kilomètres parcourus en 2025 » is a table cell and « 59 000 km en
 * 2025 » is speech.
 *
 * Both shapes are the same markup restyled, not two blocks with one hidden:
 * only the label text exists twice, and the browser reads whichever the
 * breakpoint asks for.
 */
export function HomeKeyFigures() {
  return (
    <section aria-label="Le club en chiffres" className="border-border border-b">
      <div className="container py-3.5 text-sm leading-relaxed sm:grid sm:grid-cols-4 sm:divide-x sm:divide-border sm:py-0 sm:text-base">
        {HOME_FIGURES.map(({ label, short, value }) => (
          <p
            className="after:text-border inline after:mx-1.5 after:content-['·'] last:after:content-none sm:m-0 sm:block sm:px-6 sm:py-10 sm:after:content-none sm:first:pl-0 sm:last:pr-0"
            key={label}
          >
            <span className="font-display text-brand-orange font-bold whitespace-nowrap sm:block sm:text-3xl sm:leading-none lg:text-4xl">
              {value}
            </span>{' '}
            <span className="text-muted-foreground sm:mt-3 sm:block sm:text-sm sm:leading-snug sm:text-balance">
              <span className="sm:hidden">{short ?? label}</span>
              <span className="hidden sm:inline">{label}</span>
            </span>
          </p>
        ))}
      </div>
    </section>
  )
}
