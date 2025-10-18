'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { SearchIcon } from 'lucide-react'

export const DesktopNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav className="gap-3 items-center hidden md:flex">
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink key={i} {...link} appearance="link">
            {/* TODO: Add a search icon to the search link */}
            {link.url === '/search' ? <SearchIcon /> : null}
          </CMSLink>
        )
      })}
    </nav>
  )
}
