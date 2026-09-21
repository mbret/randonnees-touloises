'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/components/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
 * Whether an address is a fragment on the page already being read.
 *
 * `next/link` asked to navigate to the URL it is already showing does nothing
 * at all, fragment and all: having once followed « Nos sorties du mois » and
 * scrolled back up, pressing it again leaves the reader where they are. The
 * hero's buttons sidestep that by being plain anchors, which is a fair trade
 * for two links that never leave the home page — but a menu entry pointing at
 * `/#agenda` is read from every other page too, where the router is exactly
 * what you want. So the choice is made per render against the page in front of
 * the reader, rather than once and for all in the markup.
 */
const isSamePageFragment = (href: string, pathname: string) => {
  const [path, fragment] = href.split('#')

  if (!fragment) return false

  return path === '' || path.replace(/\/$/, '') === pathname.replace(/\/$/, '')
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
  const pathname = usePathname()

  if (authCondition === 'loggedIn' && !user) return null
  if (authCondition === 'loggedOut' && user) return null

  const href = linkHref({ reference, type, url })

  if (!href) return null

  const size = appearance === 'link' ? 'default' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}
  /* Handed to the browser, a fragment is re-resolved on every activation, and
     `scroll-mt` on the section does the offsetting rather than a scroll
     handler. Anywhere else, the router. */
  const Anchor = isSamePageFragment(href, pathname) ? 'a' : Link

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Anchor className={cn(className)} href={href} {...newTabProps} {...rest}>
        {label && label}
        {children && children}
      </Anchor>
    )
  }

  return (
    <Button asChild className={className} size={size} variant={appearance} {...rest}>
      <Anchor className={cn(className)} href={href} {...newTabProps}>
        {label && label}
        {children && children}
        {isExternal && <ExternalLinkIcon />}
      </Anchor>
    </Button>
  )
}
