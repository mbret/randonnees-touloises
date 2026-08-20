'use client'
import { useHeaderTheme } from '@/navigation/Header/HeaderThemeProvider'
import React, { useEffect } from 'react'

/**
 * The header sits over the hero image on a post, so it is forced dark for the
 * length of the page. Shared by both namespaces a post can be served from.
 */
export const PostViewClient: React.FC = () => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  }, [setHeaderTheme])

  return <React.Fragment />
}
