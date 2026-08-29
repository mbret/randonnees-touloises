'use client'

import { useHeaderTheme } from '@/navigation/Header/HeaderThemeProvider'
import Link from 'next/link'
import React, { Suspense, useEffect, useState } from 'react'
import type { HeaderNavItem } from './staticNavItems'
import { Logo } from '@/components/Logo/Logo'
import { DesktopNav } from './DesktopNav'
import { HeaderThemeReset } from './HeaderThemeReset'
import { MobileNav } from './MobileNav'

interface HeaderClientProps {
  navItems: HeaderNavItem[]
}

export function HeaderClient({ navItems }: HeaderClientProps) {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme } = useHeaderTheme()

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      // className="container mx-auto relative z-20"
      className="sticky top-[var(--admin-bar-height)] z-12 mx-auto w-full flex-shrink-0 items-center justify-center border-b border-solid backdrop-blur-[8px] bg-background/60"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <Suspense fallback={null}>
        <HeaderThemeReset />
      </Suspense>

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
