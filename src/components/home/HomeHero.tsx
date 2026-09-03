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
 * is the price of the name, and the price went up when the name became the
 * title on a phone: 36px over two lines puts the top of the block 297px above
 * the foot of the picture where the kicker it replaced stood at 253. Holding
 * enough depth up there is most of what the shorter scrim had won back.
 * Measured on the composited photograph, cream at that top line is 9.6:1 at
 * 390px and 9.7:1 at 320px, on means of 12 — comfortably past AAA, so nothing
 * here had to move for it.
 *
 * The thin end of the fade is the desktop kicker rather than anything on a
 * phone: at `lg` the block reaches 359px, out where the ramp has fallen to 63%,
 * and cream there measures 5.9:1. That is a pass at AA and not at AAA, it
 * predates the title on the phone, and it is left alone here — the change the
 * club asked for was a phone's, and this hero's photograph is one they will
 * replace.
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
 * On a phone the title is the club's name, and it has not always been. The
 * largest type here used to be « Partager le plaisir de la randonnée » at every
 * width, on the argument that a visitor can act on a sentence and cannot act on
 * a name that is already in the logo directly above, in the tab title and in
 * the structured data. The club could not find itself on its own home page, and
 * reported it of a phone — where the logo is at its smallest and the sentence
 * fills the screen — so that is where the name takes the space. From `sm` the
 * old arrangement stands unchanged, down to the pixel: a 14px kicker over a
 * 36px sentence that reaches 48 at `lg`.
 *
 * The heading element carries the name at every width even so, which is the
 * half of this that is not a phone's. It changes nothing to look at — the
 * kicker was already the first line of the old heading — and it closes a gap
 * that arrangement admitted to in its own note: the name was in the metadata
 * and in an image whose link reads « Accueil », so no heading on the site ever
 * carried it.
 *
 * The sentence is a paragraph now rather than the rest of the heading, and on a
 * phone it sits under the name at the size of a promise rather than of a
 * caption. It is how the club describes itself on its own À propos page, and it
 * is still the only line here that says what the club is for — the name says
 * who, and a visitor who has read the name has not yet been told anything to
 * want.
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
        {/* One heading and one paragraph, and which of them looks like the
            headline changes at `sm`. On a phone the club's name is the title —
            36px, two lines on all but the widest — with the sentence under it at
            18px; from `sm` the two swap costumes and the hero is exactly the one
            that was here before, a 14px kicker over a 36px sentence that reaches
            48 at `lg`. A phone is where the club could not find its own name, so
            a phone is the only place this changes.

            Swapped in CSS rather than by rendering both arrangements and hiding
            one at each breakpoint: `display:none` keeps a hidden copy out of the
            accessibility tree but not out of the HTML, and two headings with two
            copies of every string is a page that can disagree with itself. Both
            designs run in the same order — name first, sentence second — so one
            DOM covers both and only the type changes.

            The heading is the name at every width, and that is the one thing
            here that does not revert at `sm`. It costs nothing to look at, since
            the kicker was already the first line of the old heading, and it
            closes a gap the old arrangement admitted to in its own note: the
            name was in the tab title, the Open Graph tags and the structured
            data, and in an image whose link reads « Accueil », so no heading on
            the site ever carried it.

            `sm:leading-5` is not decoration. `text-sm` takes its line-height
            from `--tw-leading` whenever something has set one, and the
            `leading-[1.05]` this heading wears on a phone sets it — so without
            the override the desktop kicker would be 14px type on a 14.7px line
            instead of the 20px line the old design gave it, and the sentence
            would sit five pixels higher than it used to. */}
        <h1 className="font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:mb-2 sm:text-sm sm:leading-5 sm:tracking-[0.14em] sm:uppercase">
          Randonnées Touloises
        </h1>

        {/* The sentence: a paragraph on a phone at 18px and 500, which is what
            keeps it reading as the club's own line rather than as the lead below
            it, and the old heading again from `sm` — display face, bold,
            `leading-[1.08]`, and the same `24ch` measure, which resolves against
            the same 36px Archivo it always did. The orange stays on the year,
            the one place the palette shows up on the photograph.

            `depuis&nbsp;1987` because `text-balance` is free to put the break
            anywhere and the year alone on a line reads as a stray date.

            No `max-w` on the phone side, and it was tried at 34ch: forty-nine
            characters at 18px measure about 386px, close enough to what 34ch
            comes to in Instrument Sans that the cap decided between one line and
            two on a coin toss and flipped between widths that should have looked
            identical. Uncapped the answer is never in doubt — the container is
            what breaks it into two balanced lines. */}
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
