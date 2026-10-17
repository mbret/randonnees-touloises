'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/components/ui'
import Link from 'next/link'
import React, { ComponentProps } from 'react'

import type { Page, Post, GlobalPage } from '@/payload-types'
import { useAuth } from '@/providers/auth'
import { linkHref } from '@/utilities/linkHref'
import { ExternalLinkIcon } from 'lucide-react'

type RelationTo = 'pages' | 'posts' | 'globalPages'

type ButtonProps = ComponentProps<typeof Button>

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
  isExternal?: boolean | null
  onClick?: () => void
}

/**
 * Routes a link never prefetches. Next prefetches every `next/link` that
 * scrolls into view, and for a route rendered per request each prefetch is a
 * function run on Vercel — on every page view, for a link hardly anyone follows.
 *
 * `/search` reads `searchParams`, so it is rendered per request, and with no
 * `loading.tsx` above it a prefetch of it fetches nothing the click can use.
 */
const neverPrefetched = new Set(['/search'])

/**
 * The Payload admin is a root layout of its own, so a link to it reloads the
 * whole page whatever renders it. A plain anchor says so: no client-side
 * navigation to pretend to, and nothing to prefetch on view or on hover. Checked
 * here rather than where the link is written because the footer's « Admin » is
 * CMS content, and so is any other link an editor points at the admin.
 */
const isAdminPath = (path: string) => path === '/admin' || path.startsWith('/admin/')

const SiteLink: React.FC<ComponentProps<'a'> & { href: string }> = ({ href, ...props }) => {
  const path = href.split(/[?#]/)[0]

  if (isAdminPath(path)) return <a href={href} {...props} />

  return <Link href={href} prefetch={neverPrefetched.has(path) ? false : undefined} {...props} />
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
  isExternal,
  ...rest
}) => {
  const { user } = useAuth()

  if (authCondition === 'loggedIn' && !user) return null
  if (authCondition === 'loggedOut' && user) return null

  const href = linkHref({ reference, type, url })

  if (!href) return null

  const size = appearance === 'link' ? 'default' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <SiteLink className={cn(className)} href={href || url || ''} {...newTabProps} {...rest}>
        {label && label}
        {children && children}
      </SiteLink>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance} {...rest}>
      <SiteLink className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
        {isExternal && <ExternalLinkIcon />}
      </SiteLink>
    </Button>
  )
}
