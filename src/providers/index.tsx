import React from 'react'

import { HeaderThemeProvider } from '../navigation/Header/HeaderThemeProvider'
import { AuthProvider } from './auth'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <AuthProvider>
      <HeaderThemeProvider>{children}</HeaderThemeProvider>
    </AuthProvider>
  )
}
