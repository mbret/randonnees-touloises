'use client'

import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Page, Post, GlobalPage } from '@/payload-types'
import { useAuth } from '@/providers/auth'

type RelationTo = 'pages' | 'posts' | 'globalPages'

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant']
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  authCondition?: 'always' | 'loggedIn' | 'loggedOut' | null
  reference?: {
    relationTo: RelationTo
    value: Page | Post | GlobalPage | string | number
  } | null
  size?: ButtonProps['size'] | null
  type?: 'custom' | 'reference' | null
  url?: string | null
  onClick?: () => void
}

export const CMSLink: React.FC<CMSLinkType> = ({
  type,
  appearance = 'inline',
  children,
  className,
  label,
  newTab,
  reference,
  size: sizeFromProps,
  authCondition,
  url,
  ...rest
}) => {
  const { user } = useAuth()

  const ignoreCollectionSlugFor: RelationTo[] = ['globalPages', 'pages']

  if (authCondition === 'loggedIn' && !user) return null
  if (authCondition === 'loggedOut' && user) return null

  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${ignoreCollectionSlugFor.includes(reference?.relationTo) ? '' : `/${reference?.relationTo}`}/${
          reference.value.slug
        }`
      : url

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link className={cn(className)} href={href || url || ''} {...newTabProps} {...rest}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance} {...rest}>
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    </Button>
  )
}
