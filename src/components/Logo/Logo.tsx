'use client'

import clsx from 'clsx'
import React from 'react'
import { useMedias } from '@/metadata/MediaProvider'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { media } = useMedias()
  const logo = media?.find((m) => m.filename === 'logo.webp')
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props
  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  if (!logo || !logo.url) return null

  return (
    /* eslint-disable @next/next/no-img-element */
    <img
      alt={logo.alt || 'Logo'}
      width={logo.width || 193}
      height={logo.height || 34}
      loading={loading}
      fetchPriority={priority}
      decoding="async"
      className={clsx('object-contain', className)}
      src={logo.url}
    />
  )
}
