import Image from 'next/image'
import Link from 'next/link'
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
 * The stops are distances from the bottom rather than percentages, because what
 * has to stay covered is the text and the text is a fixed number of pixels
 * tall. Measured as percentages the same gradient tracks the hero instead: on a
 * phone the copy fills nearly all of it, so the headline rose into the part
 * that had faded to a third and sat on a barely dimmed photograph — 2.4:1,
 * against the 7.4:1 these stops give it. In pixels the covered band is the same
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
  'oklch(0.2 0 0 / 92%) 0,',
  'oklch(0.2 0 0 / 86%) 220px,',
  'oklch(0.2 0 0 / 70%) 340px,',
  'oklch(0.2 0 0 / 16%) 460px,',
  'oklch(0.2 0 0 / 3%) 100%)',
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
    <section className="on-media text-foreground relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden md:min-h-[32rem]">
      <Image
        alt=""
        aria-hidden
        className="-z-10 object-cover"
        fill
        priority
        sizes="100vw"
        src={aboutHero}
      />
      {/* Same layer as the photograph and written after it, so it covers the
          image without coming between the image and the text. */}
      <div aria-hidden className="absolute inset-0 -z-10" style={{ backgroundImage: SCRIM }} />

      <div className="container py-10 md:py-14">
        <h1 className="font-display max-w-[24ch] text-3xl leading-[1.08] font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
          Partager le plaisir de la randonnée,{' '}
          <span className="text-brand-orange">depuis 1987</span>.
        </h1>

        <p className="text-foreground/90 mt-4 max-w-[46ch] leading-relaxed sm:text-lg">
          Six sorties par semaine autour de Toul, pour tous les niveaux, encadrées par des
          animateurs et animatrices diplômés.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link className={buttonVariants({ size: 'lg' })} href="#agenda">
            Prochaines sorties
          </Link>
          {/* `ghost` rather than `outline`: the outline variant fills itself
              with the page background, which on a photograph is a cream
              rectangle indistinguishable from the button beside it. The edge
              comes from `--border`, translucent white under `.on-media`. */}
          <Link
            className={cn(buttonVariants({ variant: 'ghost', size: 'lg' }), 'border')}
            href="#programs"
          >
            Programme et séjours
          </Link>
        </div>
      </div>
    </section>
  )
}
