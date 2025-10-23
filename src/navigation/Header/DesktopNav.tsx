'use client'

import React, { ComponentProps } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import {
  ChevronDown,
  CircleCheckIcon,
  CircleHelpIcon,
  CircleIcon,
  ExternalLinkIcon,
  SearchIcon,
} from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import Link from 'next/link'
import { cn } from '@/components/ui'

function ListItem({ url, isExternal, className, ...rest }: ComponentProps<typeof CMSLink>) {
  console.log(url, isExternal)

  return (
    <CMSLink
      appearance="inline"
      url={url}
      isExternal={isExternal}
      className={cn(className, 'flex-row items-center gap-2')}
      {...rest}
    >
      {/* TODO: Add a search icon to the search link */}
      {url === '/search' ? (
        <SearchIcon
          className="relative top-px ml-1 h-4 w-4 transition duration-200 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      ) : isExternal ? (
        <ExternalLinkIcon
          className="relative top-px ml-1 h-4 w-4 transition duration-200 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      ) : null}
    </CMSLink>
  )
}

export const DesktopNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const alwaysVisibleItems = navItems.slice(0, 3).reverse()
  const restItems = navItems.slice(3).reverse()

  return (
    <>
      <NavigationMenu viewport={false} className="max-md:hidden">
        <NavigationMenuList className="flex-wrap ">
          {restItems.length > 0 && (
            <NavigationMenuItem>
              <NavigationMenuTrigger>Plus</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-4">
                  <li>
                    {restItems.map(({ link }, i) => {
                      return (
                        <NavigationMenuLink key={i} asChild>
                          <ListItem {...link} />
                        </NavigationMenuLink>
                      )
                    })}
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          )}
          {alwaysVisibleItems.map(({ link }, i) => {
            return (
              <NavigationMenuItem key={i}>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <ListItem {...link} />
                </NavigationMenuLink>
              </NavigationMenuItem>
            )
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </>
  )
}
