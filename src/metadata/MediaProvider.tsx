'use client'

import React, { createContext, use } from 'react'

import { Media } from '@/payload-types'

type MediaContextType = {
  media?: Media[] | null
}

const initialContext: MediaContextType = {
  media: undefined,
}

const MediaContext = createContext(initialContext)

export const MediaProvider = ({
  children,
  media,
}: {
  children: React.ReactNode
  media?: Media[] | null
}) => {
  return <MediaContext value={{ media }}>{children}</MediaContext>
}

export const useMedias = (): MediaContextType => use(MediaContext)
