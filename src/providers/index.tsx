import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { AuthProvider } from './auth'
import { Media } from '@/payload-types'

export const Providers: React.FC<{
  children: React.ReactNode
  logo?: Media | null
}> = ({ children, logo }) => {
  return (
    <ThemeProvider logo={logo}>
      <AuthProvider>
        <HeaderThemeProvider>{children}</HeaderThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
