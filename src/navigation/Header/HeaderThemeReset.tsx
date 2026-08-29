'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

import { useHeaderTheme } from '@/navigation/Header/HeaderThemeProvider'

/**
 * Clears the per-page header theme whenever the route changes.
 *
 * It renders nothing, and exists as its own component so that the
 * `usePathname()` read — runtime data, which would otherwise keep the whole
 * header out of the prerendered shell — sits behind its own Suspense boundary.
 */
export function HeaderThemeReset() {
  const { setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return null
}
