'use client'

import React, { ComponentProps } from 'react'
import { CMSLink } from '@/components/Link'
import { ExternalLinkIcon, SearchIcon } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { cn } from '@/components/ui'
import type { OrderedNavItem } from './staticNavItems'

/**
 * How many of the leading nav items sit outside the "Plus" menu: two below
 * `md`, three below `lg`, four above. Each entry pairs a class for the item's
 * shortcut with the complementary one for its entry in the menu, so exactly one
 * of the two copies shows at any width and the menu never repeats what is
 * already on display.
 *
 * The counts are deliberately conservative — they hold even for long labels — so
 * that the split can be plain CSS. Measuring the viewport instead renders one
 * thing on the server and another in the browser, which breaks hydration.
 * Tailwind only picks these up as literal strings.
 */
const shortcutLadder = [
  { shortcut: '', menu: 'hidden' },
  { shortcut: '', menu: 'hidden' },
  { shortcut: 'max-md:hidden', menu: 'md:hidden' },
  { shortcut: 'max-lg:hidden', menu: 'lg:hidden' },
  { shortcut: 'max-xl:hidden', menu: 'xl:hidden' },
]

function ListItem({ url, isExternal, className, ...rest }: ComponentProps<typeof CMSLink>) {
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

export const DesktopNav: React.FC<{ navItems: OrderedNavItem[] }> = ({ navItems }) => {
  const laddered = navItems.slice(0, shortcutLadder.length)

  /* Reversed so the first item to drop out sits next to the "Plus" trigger. */
  const shortcuts = laddered
    .map((item, i) => ({ ...item, visibility: shortcutLadder[i].shortcut }))
    .reverse()

  const menuItems = [
    ...laddered.map((item, i) => ({ ...item, visibility: shortcutLadder[i].menu })),
    ...navItems.slice(shortcutLadder.length).map((item) => ({ ...item, visibility: '' })),
  ]

  return (
    <NavigationMenu viewport={false} className="max-sm:hidden">
      <NavigationMenuList className="flex-wrap">
        <NavigationMenuItem>
          <NavigationMenuTrigger>Plus</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[200px] gap-4">
              {menuItems.map(({ link, visibility }, i) => {
                return (
                  <li className={visibility} key={i}>
                    <NavigationMenuLink asChild>
                      <ListItem {...link} />
                    </NavigationMenuLink>
                  </li>
                )
              })}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {shortcuts.map(({ link, visibility }, i) => {
          return (
            <NavigationMenuItem key={i} className={visibility}>
              <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                <ListItem {...link} />
              </NavigationMenuLink>
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
