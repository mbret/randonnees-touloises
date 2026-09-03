import Image from 'next/image'
import React from 'react'

/**
 * Imported rather than referenced as `/about-hero.webp`. Next hashes the
 * contents of a static import into its filename, which is what earns the
 * optimised variants an immutable `Cache-Control`; a file sitting in `public`
 * keeps its name across deploys, so it is served `max-age=0, must-revalidate`
 * and every visit re-downloads or at least revalidates the hero.
 */
import aboutHero from '@/assets/about-hero.webp'
import { cn } from '@/components/ui'
import { buttonVariants } from '@/components/ui/button'

/**
 * A gradient rather than the flat `bg-black/50` this used to wear.
 *
 * A blanket dims the whole photograph to pay for type that only occupies the
 * foot of it — the sky and the group went half-dark so a line of text could be
 * read. This darkens where the words are and leaves the top of the picture
 * alone.
 *
 * What decides whether the fade shows as an edge is the steepest slope in it,
 * not how many stops it has, and CSS interpolates linearly between stops — so a
 * curve sampled into stops is still a run of straight segments. Sampling a
 * smootherstep every 20px made the edge visibly worse rather than better,
 * because that curve concentrates its change in the middle and reached 1.00%/px
 * where the plain ramp it replaced reached 0.62. Nothing here exceeds 0.44%/px
 * and no two adjacent segments differ by more than 0.35.
 *
 * It reaches nothing at 520px, which is about where the flat blanket did. That
 * is the price of the name: an eyebrow above the headline puts type 35px higher
 * than anything else in the hero, on the thinnest part of the fade, and holding
 * enough depth up there to carry it is most of what the shorter scrim had won
 * back. Cream at that height measured 4.5:1 with the tighter fade — a pass with
 * no margin, and this hero's photograph is one the club will replace.
 *
 * The stops are distances from the bottom rather than percentages, because what
 * has to stay covered is the text and the text is a fixed number of pixels
 * tall. Measured as percentages the same gradient tracks the hero instead: on a
 * phone the copy fills nearly all of it, so the headline rose into the part
 * that had faded to a third and sat on a barely dimmed photograph — 2.4:1,
 * against the 7.9:1 these stops give it. In pixels the covered band is the same
 * band on every screen and only the clear picture above it grows.
 *
 * The colour is neutral, and deliberately not the club's brown. Brown is right
 * for the footer, which is a surface — the logo's own plaque at page scale. A
 * scrim is not a surface: it is a shadow cast over someone else's colours, and
 * the club walks in blue-green country. Tinted warm it read as a colour cast on
 * the photograph rather than as the club's brown. The palette still shows up
 * here, in the orange on the year, where it is a colour rather than a filter.
 *
 * See `.on-media` in globals.css for what the coverage buys in contrast; the
 * ratios come from the lightness, so they are the same whatever the hue.
 */
const SCRIM = [
  'linear-gradient(to top,',
  'oklch(0.2 0 0 / 88%) 0,',
  'oklch(0.2 0 0 / 84%) 225px,',
  'oklch(0.2 0 0 / 70%) 335px,',
  'oklch(0.2 0 0 / 60%) 367px,',
  'oklch(0.2 0 0 / 46%) 400px,',
  'oklch(0.2 0 0 / 32%) 433px,',
  'oklch(0.2 0 0 / 19%) 463px,',
  'oklch(0.2 0 0 / 8%) 490px,',
  'oklch(0.2 0 0 / 0%) 520px)',
].join(' ')

/**
 * The other half of the scrim, and it exists for the navigation.
 *
 * The bar sits on the photograph rather than above it, and the top of this
 * picture is sky: cream nav labels on it measure around 1.2:1. Everything the
 * header holds lives in the first 80px, so that band is covered and the cover
 * is gone again by 230px, well before the mountains.
 *
 * Shaped by the same rule as the bottom, and it took the same correction: held
 * nearly flat to 55px and then dropped straight to full speed, which is a change
 * of slope of 0.29%/px in one step and drew exactly the band that stop was meant
 * to hide. Easing into the fall rather than starting it at once brings the worst
 * change to 0.11, for one point of coverage across the labels. Nothing here is
 * steeper than 0.39%/px.
 */
const TOP_SCRIM = [
  'linear-gradient(to bottom,',
  'oklch(0.2 0 0 / 70%) 0,',
  'oklch(0.2 0 0 / 66%) 35px,',
  'oklch(0.2 0 0 / 58%) 70px,',
  'oklch(0.2 0 0 / 46%) 105px,',
  'oklch(0.2 0 0 / 33%) 140px,',
  'oklch(0.2 0 0 / 21%) 172px,',
  'oklch(0.2 0 0 / 10%) 200px,',
  'oklch(0.2 0 0 / 0%) 235px)',
].join(' ')

/**
 * The opening of the home page: what the club does, and the two ways into the
 * page below it.
 *
 * The headline is the club's own sentence rather than its name. The name is
 * already in the logo directly above this, in the tab title and in the
 * structured data; spending the largest type on the site repeating it said
 * nothing a visitor could act on. « Partager le plaisir de la randonnée » is
 * how the club describes itself on its own À propos page.
 *
 * The two buttons are anchors, and they are two because the sections they reach
 * are genuinely two things: the agenda lists the walks you turn up to, the
 * programme lists the outings you sign up for. Both targets already carry
 * `scroll-mt-24`, so neither lands under the sticky header.
 */
export function HomeHero() {
  return (
    <section className="on-media text-foreground relative isolate flex min-h-[26rem] flex-col justify-end md:min-h-[32rem]">
      {/* The picture and its scrims, reaching `-top-20` above the section so the
          photograph runs up behind the header rather than starting under it.
          That 80px is the header's own `h-20`; the section's box is unchanged,
          so nothing below moves. The bottom scrim's stops are distances from
          the bottom, which this does not disturb. */}
      <div aria-hidden className="absolute -top-20 right-0 bottom-0 left-0 -z-10 overflow-hidden">
        <Image alt="" className="object-cover" fill priority sizes="100vw" src={aboutHero} />
        {/* What tells the header there is a photograph here, and whether the
            page is still at rest on it. Its presence is the whole of « this page
            opens with a hero » — the CSS keys off it, so the bar is transparent
            in the first paint rather than after a hydration — and it leaves the
            viewport the moment the page moves. Eight pixels rather than one so a
            stray pixel of scroll does not toggle the bar. */}
        <div className="absolute top-0 h-2 w-full" data-hero-top />
        <div className="absolute inset-0" style={{ backgroundImage: TOP_SCRIM }} />
        <div className="absolute inset-0" style={{ backgroundImage: SCRIM }} />
      </div>

      <div className="container py-10 md:py-14">
        <h1 className="font-display max-w-[24ch] text-3xl leading-[1.08] font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {/* Inside the heading rather than above it. The club's name is
              otherwise nowhere in the body of this page — it is in the title,
              the Open Graph tags and the structured data, and the logo is an
              image whose link is labelled « Accueil », so a screen reader never
              says it and a heading never carries it. Set as a kicker it reads as
              the label it is while the sentence stays the headline. */}
          <span className="mb-3 block text-xs font-semibold tracking-[0.2em] uppercase sm:text-sm">
            Randonnées Touloises
          </span>{' '}
          Partager le plaisir de la randonnée,{' '}
          <span className="text-brand-orange">depuis 1987</span>.
        </h1>

        {/* Gone below `sm`. On a phone this wraps to three or four lines and
            every one of them pushes the two buttons — the only things in the
            hero a visitor can act on — further down a picture that is already
            at its shortest, `min-h-[26rem]` against the 32 it gets from `md`.
            The headline carries what the club is and the buttons carry what to
            do about it; the count of outings and who leads them is the part
            that can wait for a wider screen — and the band of figures directly
            below the hero, which condenses to a single line at the same
            breakpoint, already says something concrete about the club there. */}
        <p className="text-foreground/90 mt-4 hidden max-w-[46ch] leading-relaxed sm:block sm:text-lg">
          Six sorties par semaine autour de Toul, pour tous les niveaux, encadrées par des
          animateurs et animatrices diplômés.
        </p>

        {/* Plain anchors rather than `next/link`. These go nowhere — they move
            the reader down the page they are already on — and the router, asked
            to navigate to the URL it is already showing, does nothing at all:
            having once followed « Prochaines sorties », scrolling back up and
            pressing it again left the reader where they were. Handed to the
            browser the fragment is re-resolved on every activation, which also
            keeps `scroll-mt-24` doing the work rather than a scroll handler. */}
        <div className="mt-7 flex flex-wrap gap-3">
          <a className={buttonVariants({ size: 'lg' })} href="#agenda">
            Prochaines sorties
          </a>
          {/* `ghost` rather than `outline`: the outline variant fills itself
              with the page background, which on a photograph is a cream
              rectangle indistinguishable from the button beside it. The edge
              comes from `--border`, translucent white under `.on-media`. */}
          <a
            className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'border')}
            href="#programs"
          >
            Programme et séjours
          </a>
        </div>
      </div>
    </section>
  )
}
