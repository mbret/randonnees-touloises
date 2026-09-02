'use client'

import { useHeaderTheme } from '@/navigation/Header/HeaderThemeProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
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

  /**
   * Whether the page has scrolled at all, on a page that opens with a
   * photograph. Elsewhere it stays false and means nothing: which pages have
   * one is settled in CSS by `body:has([data-hero-top])`, so the server sends
   * the right state and there is no hydration flash to avoid here.
   *
   * At all, rather than past the hero, and that is the whole design rather than
   * a simplification of it. The scrim that makes cream labels legible is part of
   * the photograph, so it scrolls with the photograph: one pixel down and the
   * bar is over picture that was never darkened for it. Measured across a
   * scroll, labels fell to 3.0:1 by 120px and to 1.00:1 — invisible — by 280px.
   * Transparent is only ever safe at rest.
   *
   * That also leaves nothing to compute. There is no header height to measure,
   * no admin-bar offset to add to it, and no boundary to re-derive from
   * `boundingClientRect`: the sentinel sits at the top of the document and the
   * question is only whether it is still on screen.
   */
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    const sentinel = document.querySelector('[data-hero-top]')

    if (!sentinel) {
      /* Deferring to the effect is the point, as with the theme above: leaving
       * the flag set on a page with no photograph would carry a stale
       * `data-scrolled` back to one that has, and show the bar solid for a frame
       * over a hero the reader has not scrolled yet. */
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScrolled(false)
      return
    }

    /* `isIntersecting` and nothing else. Re-deriving the answer from
     * `boundingClientRect` against a margin, as this first did, leaves the
     * boundary case to a floating-point comparison: creeping back up, the one
     * callback at re-entry could report the sentinel exactly on the line, read
     * as still past, and never fire again — the bar stayed frosted at the top of
     * the page. */
    const observer = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting))

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
      /* A fixed height, not padding around whatever the logo happens to be: a
       * hero has to know how far to run up behind this bar, and a height set by
       * an editor's upload is not a number anything else can be written
       * against. `h-20` here and `-top-20` in `HomeHero` are the pair.
       *
       * The height is on the header rather than on the row inside it so that
       * the border counts within it — box-sizing is border-box. With `h-20` on
       * the row the bar measured 81px against the hero's 80, and the page
       * showed through as a hairline above the photograph. */
      className="bg-background/92 sticky top-[var(--admin-bar-height)] z-12 mx-auto h-20 w-full flex-shrink-0 items-center justify-center border-b border-solid backdrop-blur-[20px] backdrop-saturate-125 transition-[color,background-color,border-color,backdrop-filter]"
      /* No duration of its own: the entries inside carry
       * `transition-[color,box-shadow]` from `navigationMenuTriggerStyle` and
       * the menu button `transition-all`, both on the default 150ms, so a bar
       * set to 200ms finished after its own labels had. `backdrop-filter` is
       * named explicitly because `transition-colors` does not cover it, and the
       * frosting was appearing in one step under a fading background. */
      {...(theme ? { 'data-theme': theme } : {})}
      {...(scrolled ? { 'data-scrolled': '' } : {})}
    >
      <div className="container flex h-full items-center justify-between">
        <Link aria-label="Accueil" href="/">
          <Logo loading="eager" priority="high" className="max-h-14 w-auto" />
        </Link>
        <DesktopNav navItems={navItems} />
        <MobileNav navItems={navItems} />
      </div>
    </header>
  )
}
