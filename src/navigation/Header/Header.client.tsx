'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import type { Header, Media } from '@/payload-types'
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
      className="container mx-auto relative z-20   "
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="py-4 flex justify-between">
        <Link href="/">
          <Logo loading="eager" priority="high" />
        </Link>
        <DesktopNav data={data} />
        <MobileNav data={data} />
      </div>
    </header>
  )
}
