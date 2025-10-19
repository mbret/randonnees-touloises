'use client'

import React, { createContext, useCallback, use, useState } from 'react'
import canUseDOM from '@/utilities/canUseDOM'

type HeaderTheme = 'light' | 'dark' | 'system' | null

export interface ContextType {
  headerTheme?: HeaderTheme
  setHeaderTheme: (theme: HeaderTheme) => void
}

const initialContext: ContextType = {
  headerTheme: undefined,
  setHeaderTheme: () => null,
}

const HeaderThemeContext = createContext(initialContext)

export const HeaderThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [headerTheme, setThemeState] = useState<HeaderTheme | undefined | null>(
    canUseDOM ? (document.documentElement.getAttribute('data-theme') as HeaderTheme) : undefined,
  )

  const setHeaderTheme = useCallback((themeToSet: HeaderTheme) => {
    setThemeState(themeToSet)
  }, [])

  return <HeaderThemeContext value={{ headerTheme, setHeaderTheme }}>{children}</HeaderThemeContext>
}

export const useHeaderTheme = (): ContextType => use(HeaderThemeContext)
