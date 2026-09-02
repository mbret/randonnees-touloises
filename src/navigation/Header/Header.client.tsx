'use client'

import { useHeaderTheme } from '@/navigation/Header/HeaderThemeProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import type { OrderedNavItem } from './staticNavItems'
import { Logo } from '@/components/Logo/Logo'
import { DesktopNav } from './DesktopNav'
import { MobileNav } from './MobileNav'

interface HeaderClientProps {
  navItems: OrderedNavItem[]
}

export function HeaderClient({ navItems }: HeaderClientProps) {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  const headerRef = useRef<HTMLElement>(null)

  /**
   * Whether the page has scrolled past the photograph this bar was sitting on.
   *
   * Only ever true on a page that opens with one. Which pages those are is
   * settled in CSS, by `body:has([data-hero-end])` — the bar is transparent
   * there from the first paint, with nothing to wait for — and this state only
   * says when to stop being transparent. So there is no flash to avoid here:
   * the attribute is absent on the server, which is what an unscrolled page
   * wants, on a page with a hero and on a page without one alike.
   *
   * The crossing is watched rather than the scroll position polled: one
   * callback at the boundary instead of a handler on every frame of every
   * scroll, on a site read mostly on a phone.
   */
  const [scrolledPastMedia, setScrolledPastMedia] = useState(false)

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    const sentinel = document.querySelector('[data-hero-end]')
    const header = headerRef.current

    if (!sentinel || !header) {
      setScrolledPastMedia(false)
      return
    }

    /* Measured rather than assumed: the bar's height is fixed in one place, and
     * reading it back is what keeps this from being a second copy of it. */
    const height = Math.round(header.getBoundingClientRect().height)

    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPastMedia(entry.boundingClientRect.top <= height),
      { rootMargin: `-${height}px 0px 0px 0px` },
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
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
      className="bg-background/92 sticky top-[var(--admin-bar-height)] z-12 mx-auto w-full flex-shrink-0 items-center justify-center border-b border-solid backdrop-blur-[20px] backdrop-saturate-125"
      ref={headerRef}
      {...(theme ? { 'data-theme': theme } : {})}
      {...(scrolledPastMedia ? { 'data-scrolled': '' } : {})}
    >
      {/* A fixed height, not padding around whatever the logo happens to be.
       * A hero has to know how far to run up behind this bar, and a bar whose
       * height is set by an editor's upload is not a number anything else can
       * be written against. `h-20` and `-top-20` in `HomeHero` are the pair. */}
      <div className="container flex h-20 items-center justify-between">
        <Link aria-label="Accueil" href="/">
          <Logo loading="eager" priority="high" className="max-h-14 w-auto" />
        </Link>
        <DesktopNav navItems={navItems} />
        <MobileNav navItems={navItems} />
      </div>
    </header>
  )
}
