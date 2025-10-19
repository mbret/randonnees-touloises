import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { AuthProvider } from './auth'
import { Media } from '@/payload-types'

export const Providers: React.FC<{
  children: React.ReactNode
  media?: Media[] | null
}> = ({ children, media }) => {
  return (
    <ThemeProvider media={media}>
      <AuthProvider>
        <HeaderThemeProvider>{children}</HeaderThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
