'use client'

import { useHeaderTheme } from '@/navigation/Header/HeaderThemeProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import type { Header } from '@/payload-types'
import { Logo } from '@/components/Logo/Logo'
import { DesktopNav } from './DesktopNav'
import { MobileNav } from './MobileNav'

interface HeaderClientProps {
  data: Header
}

export function HeaderClient({ data }: HeaderClientProps) {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

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
      <div className="container py-4 flex justify-between items-center">
        <Link href="/">
          <Logo loading="eager" priority="high" className="max-h-14 w-auto" />
        </Link>
        <DesktopNav data={data} />
        <MobileNav data={data} />
      </div>
    </header>
  )
}
