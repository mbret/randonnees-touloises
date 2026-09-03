import React from 'react'

/**
 * The horizon the footer rises behind, and two of the club's own on the crest.
 *
 * The band between the page and the footer used to be a straight line, which is
 * the one shape that says nothing. A ridge says where the club spends its
 * Sundays, and it costs a kilobyte of path data: no image request, no script,
 * nothing to load before it draws.
 *
 * Angular rather than rounded. The soft version of this is the wave every
 * landing page grew in 2018 — it reads as a divider, a shape borrowed from a
 * template. Straight segments meeting at a point read as a skyline, which is
 * what the club walks along.
 *
 * Two ranges rather than one, because the far one is what makes it a landscape:
 * a single silhouette is a torn edge, and the moment a paler range shows behind
 * it the eye reads distance. The colours are the footer's own ground and one
 * step up from it — see `--plaque-ground` and `--plaque-ridge` in globals.css.
 */

/**
 * Two drawings of the same range, because one stretched across every screen is
 * not the same drawing.
 *
 * `preserveAspectRatio="none"` maps the viewBox width onto whatever width the
 * band has and leaves the height alone, which is what keeps the peaks at a
 * fixed number of pixels tall. It also means the *slopes* are whatever the
 * viewport makes them: the narrow drawing put on a 1400px screen is stretched
 * three and a half times, and a range that reads as the Vosges on a phone
 * flattens into rolling nothing on a laptop. The wide drawing carries more
 * peaks across a wider viewBox, so both land near 1:1 where they are used.
 *
 * The crest the walkers stand on is deliberately flat, and sits at the same
 * fraction of the width in both — from 50.3% to 65.1%. That is what lets one
 * pair of figures, positioned in percent, stand on the ground in both drawings
 * and at every width between: a sloping crest would only line up at one.
 */
const NARROW = {
  viewBox: '0 0 390 64',
  far: 'M0,34 L40,22 L74,32 L118,10 L156,28 L196,16 L236,30 L280,12 L318,26 L352,18 L390,30 L390,64 L0,64 Z',
  near: 'M0,46 L34,34 L58,41 L96,20 L128,38 L156,30 L196,30 L254,30 L268,40 L300,25 L330,39 L356,30 L390,43 L390,64 L0,64 Z',
}

const WIDE = {
  viewBox: '0 0 1100 64',
  far: 'M0,32 L90,18 L170,30 L260,8 L340,26 L430,14 L520,26 L610,10 L700,26 L790,12 L880,28 L970,16 L1050,28 L1100,22 L1100,64 L0,64 Z',
  near: 'M0,44 L70,32 L130,42 L210,18 L285,38 L345,28 L420,44 L490,34 L553,30 L716,30 L760,42 L830,22 L900,38 L960,28 L1030,42 L1100,34 L1100,64 L0,64 Z',
}

/**
 * The paint, and it is a `style` rather than a `fill` attribute on purpose:
 * `fill="var(--x)"` does not resolve. A presentation attribute is a *fallback*
 * for the CSS property and browsers do not run custom-property substitution on
 * one — the value is dropped and the shape renders as if nothing were set. The
 * same string in a CSS declaration works, which is the form below.
 *
 * The names exist only while `.plaque` is in force, which is only on a light
 * page. The fallbacks are the page's own colour, so on a dark page every layer
 * collapses into the sky rather than rendering as black paths — the band is
 * hidden outright there, and this is what keeps the mistake quiet if it ever
 * is not.
 */
const GROUND = { fill: 'var(--plaque-ground, var(--background))' }
const RIDGE = { fill: 'var(--plaque-ridge, var(--background))' }
const SKY = { fill: 'var(--background)' }

/**
 * One range. The rectangle underneath is the page's own colour: the footer's
 * background is painted across its whole box, so without it the sky above the
 * peaks would be footer brown and there would be no skyline at all.
 */
function Range({ className, far, near, viewBox }: { className: string } & typeof NARROW) {
  return (
    <svg className={className} preserveAspectRatio="none" viewBox={viewBox}>
      <rect height="100%" style={SKY} width="100%" />
      <path d={far} style={RIDGE} />
      <path d={near} style={GROUND} />
    </svg>
  )
}

/**
 * A walker: head, pack, body, two legs mid-stride, an arm and a pole. Drawn
 * once and placed twice, the second a little behind — the club walks in groups
 * and a single figure on a summit is a different sport.
 *
 * Feet sit on y=29.5 rather than the foot of the box, so the soles land on the
 * crest at 30 rather than a half pixel under it.
 */
function Walker({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 29.5) scale(1.55)`}>
      <circle cx="0" cy="-12.6" r="1.9" />
      <path d="M-4.8,-11.4 q-1.7,.3 -1.6,2.1 l.4,3.1 q.2,1.4 1.7,1.4 l1.7,0 l0,-6.6 z" />
      <path d="M-1.7,-10.8 L1.5,-10.8 L2.5,-5.2 L-2.1,-5.2 Z" />
      <path d="M-1.9,-5.2 L-4,.3 L-2.1,.3 L.1,-3.9 Z" />
      <path d="M.6,-5.2 L3,.3 L4.8,.3 L2.5,-5.2 Z" />
      <path d="M1.2,-9.9 L4.3,-6.5 L3.5,-5.7 L.4,-9 Z" />
      <rect height="7.4" width=".6" x="3.9" y="-6.9" />
    </g>
  )
}

/**
 * `aria-hidden` because it is scenery: there is nothing here a reader needs
 * read to them, and the footer's own contents say everything this illustrates.
 *
 * `dark:hidden` because the skyline is the same idea as `.plaque` itself — a
 * light page needs a base to end on, a dark page already is one. On a dark page
 * the footer is the page, and a horizon between a thing and itself is nonsense.
 */
export function Skyline() {
  return (
    <div aria-hidden className="relative h-16 dark:hidden">
      <Range {...NARROW} className="block h-16 w-full md:hidden" />
      <Range {...WIDE} className="hidden h-16 w-full md:block" />

      {/* Their own drawing rather than two more paths in the range above, which
          is stretched: people stretched three times sideways stop being people.
          At 57.7% they stand in the middle of the flat crest both ranges carry
          there, and 46px of figures fit inside it down to a 320px screen. */}
      <svg
        className="absolute top-0 left-[57.7%] h-[30px] w-auto -translate-x-1/2"
        style={GROUND}
        viewBox="0 0 46 30"
      >
        <Walker x={12} />
        <Walker x={34} />
      </svg>
    </div>
  )
}
