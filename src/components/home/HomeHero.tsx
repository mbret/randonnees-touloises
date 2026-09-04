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
 * This is the `sm`-and-up ramp; `SCRIM_PHONE` below is the one a phone gets.
 * It reaches nothing at 520px, which is about where the flat blanket did.
 *
 * Its thin end is the kicker: at `lg` the text block reaches 363px, out where
 * the ramp has fallen to 62%, and cream there measures 5.3:1 — a pass at AA and
 * not at AAA. Holding the ramp higher for the wide hero is the fix, and wants
 * measuring on the photograph that replaces this one.
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
 * The same ramp for a phone, lifted off the picture.
 *
 * A phone is 496px of photograph and the ramp above covers all of it, so the
 * club never saw their own mountains undimmed — reported as a hero that is too
 * dark, and it was. What buys the light back is the type: a phone's title is
 * 36px bold, which WCAG counts as large text and holds at 4.5:1 where the
 * `sm` layout's 18px kicker needs 7:1 for the same grade.
 *
 * So the plateau comes down from 88% to 76% and the whole ramp with it, and the
 * mean lightness of the phone's picture rises by about half. Composited against
 * the photograph, the tightest three bands are the sentence at 7.1:1, the ghost
 * button's label at 8.0:1 — both 18px and 14px, so both AAA for normal text —
 * and the title at 6.5:1, which is AAA for large text with room over. Going
 * lighter than this is possible and costs the AAA: the next step down measured
 * 5.3:1 on the sentence.
 *
 * Only below `sm`, and that is the whole reason there are two of these. From
 * `sm` the name is a kicker again and the sentence carries the size, and this
 * ramp under that layout puts the kicker at 3.6:1 — a fail at AA. Nothing above
 * `sm` moves.
 *
 * Shaped by the same rule as the others: nothing here exceeds 0.40%/px and no
 * two adjacent segments differ by more than 0.10.
 */
const SCRIM_PHONE = [
  'linear-gradient(to top,',
  'oklch(0.2 0 0 / 76%) 0,',
  'oklch(0.2 0 0 / 74%) 150px,',
  'oklch(0.2 0 0 / 70%) 230px,',
  'oklch(0.2 0 0 / 64%) 285px,',
  'oklch(0.2 0 0 / 54%) 335px,',
  'oklch(0.2 0 0 / 41%) 380px,',
  'oklch(0.2 0 0 / 27%) 420px,',
  'oklch(0.2 0 0 / 13%) 455px,',
  'oklch(0.2 0 0 / 0%) 490px)',
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
 * On a phone the club's name is the title. The largest type used to be
 * « Partager le plaisir de la randonnée » at every width, on the argument that a
 * visitor can act on a sentence and not on a name already in the logo above;
 * the club could not find itself on its own home page, and reported it of a
 * phone, so that is where the name takes the space. From `sm` the name is a
 * kicker over the sentence, as before, one size up from the 14px it was.
 *
 * The heading element carries the name at every width. It changes nothing to
 * look at — the kicker was already the first line of the old heading — and no
 * heading on the site carried the club's name before.
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
        {/* Two elements rather than one, because the two ramps differ by more
            than a value: a phone can be lighter only because its title is
            large text, and the `sm` layout's kicker is not. */}
        <div className="absolute inset-0 sm:hidden" style={{ backgroundImage: SCRIM_PHONE }} />
        <div className="absolute inset-0 hidden sm:block" style={{ backgroundImage: SCRIM }} />
      </div>

      <div className="container py-10 md:py-14">
        {/* One heading and one paragraph that swap costumes at `sm`: on a
            phone the name is the title at 36px with the sentence under it at
            18px, and from `sm` the name is a kicker over the sentence.

            In CSS rather than two arrangements with one under `display:none` —
            a hidden copy stays out of the accessibility tree but not out of the
            HTML, and two headings with two copies of every string is a page
            that can disagree with itself. Both designs run in the same order,
            name then sentence, so one DOM covers both.

            18px at `sm`, up from the 14px the kicker had. Uppercase at 0.14em
            it still reads as a label rather than a title. It does not buy any
            slack in WCAG terms — 18px bold is 13.5pt, under the 14pt that would
            make it large text — and the taller line box lifts the block 4px, so
            the kicker sits on 62% of scrim coverage at `lg` rather than 63%,
            where cream measures 5.3:1 against the 5.9:1 it had. Both pass AA
            and fail AAA; the step does not change what it complies with, and
            the thin end of this fade is a scrim problem rather than a type
            one — see `SCRIM` above.

            `sm:leading-6` is load-bearing, not decoration: `text-lg` takes its
            line-height from `--tw-leading` whenever something has set one, and
            the `leading-[1.05]` this heading wears on a phone sets it. Without
            an override the kicker would be 18px type on a 18.9px line. */}
        <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:mb-2 sm:text-lg sm:leading-6 sm:tracking-[0.14em] sm:uppercase">
          Randonnées Touloises
        </h1>

        {/* A paragraph on a phone at 18px and 500 — enough to read as the
            club's own line rather than as the lead below it — and the old
            heading again from `sm`: display face, bold, `leading-[1.08]`, the
            same `24ch` measure against the same 36px Archivo.

            `depuis&nbsp;1987` keeps `text-balance` from stranding the year on a
            line of its own. No `max-w` on the phone side: at 34ch the cap fell
            within a few pixels of the line's natural width, so it decided
            between one line and two on a coin toss and flipped between widths
            that should have looked identical. The container breaks it into two
            balanced lines without help. */}
        <p className="mt-3 text-lg leading-snug font-medium text-balance sm:font-display sm:mt-0 sm:max-w-[24ch] sm:text-4xl sm:leading-[1.08] sm:font-bold sm:tracking-tight lg:text-5xl">
          Partager le plaisir de la randonnée,{' '}
          <span className="text-brand-orange">depuis&nbsp;1987</span>.
        </p>

        {/* Gone below `sm`. On a phone this wraps to three or four lines and
            every one of them pushes the two buttons — the only things in the
            hero a visitor can act on — further down a picture that is already
            at its shortest, `min-h-[26rem]` against the 32 it gets from `md`.
            The name and the sentence above carry who the club is and what it
            is for, and the buttons carry what to do about it; the count of
            outings and who leads them is the part that can wait for a wider
            screen — and the band of figures directly below the hero, which
            condenses to a single line at the same breakpoint, already says
            something concrete about the club there. */}
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
