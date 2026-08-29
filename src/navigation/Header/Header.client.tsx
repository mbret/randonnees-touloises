'use client'

import { useHeaderTheme } from '@/navigation/Header/HeaderThemeProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import type { HeaderNavItem } from './staticNavItems'
import { Logo } from '@/components/Logo/Logo'
import { DesktopNav } from './DesktopNav'
import { MobileNav } from './MobileNav'

interface HeaderClientProps {
  navItems: HeaderNavItem[]
}

export function HeaderClient({ navItems }: HeaderClientProps) {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  /**
   * Deferring to an effect is the point here, not an oversight, so the rule
   * against seeding state from one is suppressed rather than obeyed.
   *
   * The theme is not known to the server: `HeaderThemeProvider` reads it off
   * `<html data-theme>` in the browser and has nothing to read while
   * rendering on the server. Deriving `data-theme` from it during render would
   * therefore emit an attribute the server never sent, and the header would
   * hydrate mismatched. An effect runs after hydration, which is what makes
   * the first client render agree with the HTML.
   *
   * Holding the last theme asked for also matters: navigating clears
   * `headerTheme` above before the new page's own effect sets it, and this
   * state is what stops the header falling back to its default in between.
   */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      // className="container mx-auto relative z-20"
      className="sticky top-[var(--admin-bar-height)] z-12 mx-auto w-full flex-shrink-0 items-center justify-center border-b border-solid backdrop-blur-[8px] bg-background/60"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container py-4 flex justify-between items-center">
        <Link aria-label="Accueil" href="/">
          <Logo loading="eager" priority="high" className="max-h-14 w-auto" />
        </Link>
        <DesktopNav navItems={navItems} />
        <MobileNav navItems={navItems} />
      </div>
    </header>
  )
}
