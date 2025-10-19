import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { FederationLogo } from './FederationLogo'
import Link from 'next/link'

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
      <div className="container mx-auto py-8 gap-8 flex flex-row justify-center">
        <Link href="https://www.ffrandonnee.fr/" target="_blank">
          <FederationLogo />
        </Link>
      </div>
      <div className="container mx-auto py-8 gap-8 flex flex-row justify-between">
        <ThemeSelector />
        <nav className="flex flex-col md:flex-row gap-4">
          {navItems.map(({ link }, i) => {
            return <CMSLink key={i} appearance="link" {...link} />
          })}
        </nav>
      </div>
    </footer>
  )
}
