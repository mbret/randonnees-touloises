import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import Link from 'next/link'

import { CMSLink } from '@/components/Link'
import { ExternalLinkIcon } from 'lucide-react'
import { FederationLogo } from './FederationLogo'
// Commented out, not deleted, while the site is forced light — see the
// reasoning at the `ThemeProvider` in `app/(frontend)/layout.tsx`. Uncomment
// this together with the block below to bring the switch back.
// import { ModeToggle } from '@/theme/ModeToggle'

/**
 * The legal row, set as plain links rather than with `appearance="link"`.
 *
 * That appearance reads like the right thing to pass and is not: `CMSLink`
 * hands it to `Button`, which sizes it `h-9 px-4`. Each of these was a 36px box
 * with 16px of padding down either side, and on a phone the three of them
 * stacked into a column 52px from one link's text to the next's. The gap
 * between them was never what made that row so tall.
 *
 * `py-1` rather than nothing, so the target is a little taller than the text —
 * these are the smallest things on the page to press, and they are at the very
 * bottom of it, where a thumb is least accurate.
 */
const FOOTER_LINK =
  'text-primary inline-flex items-center gap-1.5 rounded-sm px-1 py-1 text-sm underline-offset-4 transition-colors hover:underline'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()
  const navItems = footerData?.navItems || []

  return (
    /* See the note on `.plaque` in globals.css: it carries its own palette, and
     * only on a light page. */
    <footer className="plaque text-foreground mt-auto">
      {/* One column with one gap, where this was three containers each paying
          its own `py-8` on top of the last one's. The address, the affiliation
          and the legal row are the same small print doing the same job; set
          32px apart, with a stack of button-sized links at the end, they read
          as three footers rather than as one band. */}
      <div className="container flex flex-col items-center gap-6 py-12 text-center">
        {/* `address` because it is one — the club's own contact details, which
            is exactly the element's job and not the general-purpose « any
            address » it is often mistaken for. `not-italic` because browsers
            still italicise it by default. */}
        <address className="text-sm leading-relaxed not-italic">
          Maison Des Associations
          <br />
          2, cours Raymond Poincaré · 54200 Toul
        </address>

        {/* One link around badge and wording alike: two links to the same page,
            read one after the other, are only an obstacle to anyone tabbing or
            listening through the footer. The badge is decorative because the
            wording beside it already names where the link goes. */}
        {/* `text-left` against the centring the rest of the footer inherits.
            The wording runs to two lines on a phone, and centred under a badge
            the short second line floats free of everything — the block reads as
            a caption that has come loose. Ranged left it keeps one edge with
            the badge beside it, which is the shape a logo and its wording
            usually take. Nothing to see from `md` up, where it is one line. */}
        <Link
          className="hover:text-primary inline-flex items-center gap-3 text-left text-sm transition-colors"
          href="https://www.ffrandonnee.fr/"
          rel="noopener noreferrer"
          target="_blank"
        >
          {/* The federation's mark is two fixed colours, #ED1C24 and #034EA2,
              and it is theirs — we are licensed to display it, not to recolour
              it. That blue is 1.65:1 on the plaque, so on this ground the mark
              would half disappear. It gets the pale plate a partner logo
              usually gets, which is also how the federation's own guidelines
              present it. */}
          <span className="bg-brand-brown-foreground inline-flex rounded-md px-2.5 py-1.5">
            <FederationLogo />
          </span>
          Affilié à la Fédération Française de Randonnée Pédestre
        </Link>

        <div className="w-full md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
          {/* The theme switch, commented out while the site is forced light —
          see the reasoning at the `ThemeProvider` in `app/(frontend)/layout.tsx`.
          Uncomment the block below and the `ModeToggle` import at the top of
          this file to bring it back. The nav sits in column 2 of a
          `1fr auto 1fr` grid, so it stays centred whether or not this column is
          filled.

          <div className="md:col-start-1 md:row-start-1 md:justify-self-start">
            <ModeToggle />
          </div>
          */}
          {/* A column on a phone and a row from `md`, which is what it always
              was — three links wrapped mid-row leave « Admin » sitting beside
              « Politique de confidentialité » and one line above it half empty.
              What changed is that 4px separates them now, where sixteen plus
              two button boxes used to put 52px of brown between one link and
              the next. */}
          <nav className="flex flex-col items-center gap-1 md:col-start-2 md:row-start-1 md:flex-row md:flex-wrap md:justify-center md:gap-x-6">
            <CMSLink
              appearance="inline"
              className={FOOTER_LINK}
              label="Règlement intérieur"
              type="custom"
              url="/terms"
            />
            <CMSLink
              appearance="inline"
              className={FOOTER_LINK}
              label="Politique de confidentialité"
              type="custom"
              url="/privacy"
            />
            {navItems.map(({ link }, i) => {
              return (
                <CMSLink key={i} appearance="inline" className={FOOTER_LINK} {...link}>
                  {/* Drawn by hand because the button appearance drew it for us
                      and the inline one does not, while « Lien externe » is
                      still a checkbox on every one of these links. */}
                  {link.isExternal && <ExternalLinkIcon aria-hidden className="size-3.5" />}
                </CMSLink>
              )
            })}
          </nav>
        </div>

        {/* Last rather than first, and the quietest thing here. A copyright line
            is the one part of a footer nobody came for; leading with it put the
            site's own domain name above the club's address.

            The year is read as the page renders. The pages that hold
            themselves static set `revalidate` between 600 and 3600, and the
            rest are rendered per request, so the stalest HTML anyone can be
            served on the first of January is an hour old. An hour is also why
            this does not reach for `Europe/Paris`: the server's midnight and
            the club's are at most two hours apart, and the cache is already
            fuzzier than that. What it replaces is a literal `2025`, which had
            to be remembered every January and was not. */}
        <p className="text-muted-foreground text-xs">
          randonnées-touloises.net · © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
