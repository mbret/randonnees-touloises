import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import Link from 'next/link'

import { CMSLink } from '@/components/Link'
import { FederationLogo } from './FederationLogo'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()
  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border py-8">
      <div className="container flex justify-center flex-col items-center gap-2">
        <p className="text-muted-foreground text-sm">randonnées-touloises.net - © 2025</p>
        <p className="text-muted-foreground text-sm text-center">
          Maison Des Associations 2, cours Raymond Poincaré 54200 Toul
        </p>
      </div>
      <div className="container flex justify-center pt-8">
        {/* One link around badge and wording alike: two links to the same page,
            read one after the other, are only an obstacle to anyone tabbing or
            listening through the footer. The badge is decorative because the
            wording beside it already names where the link goes. */}
        <Link
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-3 text-sm transition-colors"
          href="https://www.ffrandonnee.fr/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <FederationLogo />
          Affilié à la Fédération Française de Randonnée Pédestre
        </Link>
      </div>
      <div className="container py-8 gap-4 flex flex-col items-center md:grid md:grid-cols-[1fr_auto_1fr]">
        {/* The theme switch is unmounted while the site is forced light — see
         * the reasoning at the `ThemeProvider` in the frontend layout. Restoring
         * it means putting `<ModeToggle />` back in this first grid column; the
         * nav sits in column 2 of a `1fr auto 1fr` grid, so it stays centred
         * either way. */}
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
