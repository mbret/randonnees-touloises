'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { ChevronDown, ExternalLinkIcon, SearchIcon } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'

export const DesktopNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <>
      <NavigationMenu className="max-md:hidden">
        <NavigationMenuList className="flex-wrap">
          {navItems.map(({ link }, i) => {
            return (
              <NavigationMenuItem key={i}>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <CMSLink {...link} appearance="inline">
                    {/* TODO: Add a search icon to the search link */}
                    {link.url === '/search' ? (
                      <SearchIcon
                        className="relative top-px ml-1 h-4 w-4 transition duration-200 group-data-[state=open]:rotate-180"
                        aria-hidden="true"
                      />
                    ) : null}
                    {link.isExternal ? (
                      <ExternalLinkIcon
                        className="relative top-px ml-1 h-4 w-4 transition duration-200 group-data-[state=open]:rotate-180"
                        aria-hidden="true"
                      />
                    ) : null}
                  </CMSLink>
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </>
  )
}
