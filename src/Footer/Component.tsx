import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import Link from 'next/link'

import { CMSLink } from '@/components/Link'
import { FederationLogo } from './FederationLogo'
// Commented out, not deleted, while the site is forced light — see the
// reasoning at the `ThemeProvider` in `app/(frontend)/layout.tsx`. Uncomment
// this together with the block below to bring the switch back.
// import { ModeToggle } from '@/theme/ModeToggle'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()
  const navItems = footerData?.navItems || []

  return (
    /* See the note on `.plaque` in globals.css: it carries its own palette, and
     * only on a light page. */
    <footer className="plaque text-foreground mt-auto py-8">
      <div className="container flex justify-center flex-col items-center gap-2">
        <p className="text-sm">randonnées-touloises.net - © 2025</p>
        <p className="text-sm text-center">
          Maison Des Associations 2, cours Raymond Poincaré 54200 Toul
        </p>
      </div>
      <div className="container flex justify-center pt-8">
        {/* One link around badge and wording alike: two links to the same page,
            read one after the other, are only an obstacle to anyone tabbing or
            listening through the footer. The badge is decorative because the
            wording beside it already names where the link goes. */}
        <Link
          className="hover:text-primary inline-flex items-center gap-3 text-sm transition-colors"
          href="https://www.ffrandonnee.fr/"
          rel="noopener noreferrer"
          target="_blank"
        >
          {/* The federation's mark is two fixed colours, #ED1C24 and #034EA2,
              and it is theirs — we are licensed to display it, not to recolour
              it. That blue is 1.11:1 on the plaque, so on this ground the mark
              would half disappear. It gets the pale plate a partner logo
              usually gets, which is also how the federation's own guidelines
              present it. */}
          <span className="bg-brand-brown-foreground inline-flex rounded-md px-2.5 py-1.5">
            <FederationLogo />
          </span>
          Affilié à la Fédération Française de Randonnée Pédestre
        </Link>
      </div>
      <div className="container py-8 gap-4 flex flex-col items-center md:grid md:grid-cols-[1fr_auto_1fr]">
        {/* The theme switch, commented out while the site is forced light — see
        the reasoning at the `ThemeProvider` in `app/(frontend)/layout.tsx`.
        Uncomment the block below and the `ModeToggle` import at the top of this
        file to bring it back. The nav sits in column 2 of a `1fr auto 1fr`
        grid, so it stays centred whether or not this column is filled.

        <div className="md:col-start-1 md:row-start-1 md:justify-self-start">
          <ModeToggle />
        </div>
        */}
        <nav className="flex flex-col md:flex-row items-center gap-4 md:col-start-2 md:row-start-1">
          <CMSLink appearance="link" label="Règlement intérieur" type="custom" url="/terms" />
          <CMSLink
            appearance="link"
            label="Politique de confidentialité"
            type="custom"
            url="/privacy"
          />
          {navItems.map(({ link }, i) => {
            return <CMSLink key={i} appearance="link" {...link} />
          })}
        </nav>
      </div>
    </footer>
  )
}
