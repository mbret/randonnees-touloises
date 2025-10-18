'use client'

import clsx from 'clsx'
import React from 'react'
import { useTheme } from '@/providers/Theme'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { logo } = useTheme()
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
      className={clsx('max-w-[9.375rem] w-full h-[52px]', className)}
      src={logo.url}
    />
  )
}
