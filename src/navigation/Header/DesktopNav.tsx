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
 * `md`, three below `lg`, five from `lg` up. Each entry pairs a class for the
 * item's shortcut with the complementary one for its entry in the menu, so
 * exactly one of the two copies shows at any width and the menu never repeats
 * what is already on display.
 *
 * The ladder ends at `lg` because the bar stops growing there. Everything in
 * the header is laid out inside `container`, which is capped at 64rem — `lg`
 * exactly — so a wider viewport only widens the margins around the page. The
 * step at `xl` this used to end on therefore bought a fifth shortcut out of no
 * new room at all: the same 960px of bar carried four links on a 1024px screen
 * and five on an ultrawide, and the two disagreed about a menu neither had
 * resized. Whatever the widest bar holds, it holds from `lg` up.
 *
 * Five is what that widest bar has room for. At `lg` the container leaves
 * 960px, the logo takes about 105 of them, and the trigger and five links
 * measure around 635 together — room to spare for labels longer than the ones
 * in the menu today, which is the margin these counts are picked for. The two
 * steps below `lg` are conservative in the same way, since the split has to be
 * plain CSS: measuring the viewport instead renders one thing on the server and
 * another in the browser, which breaks hydration. Tailwind only picks these up
 * as literal strings.
 */
const shortcutLadder = [
  { shortcut: '', menu: 'hidden' },
  { shortcut: '', menu: 'hidden' },
  { shortcut: 'max-md:hidden', menu: 'md:hidden' },
  { shortcut: 'max-lg:hidden', menu: 'lg:hidden' },
  { shortcut: 'max-lg:hidden', menu: 'lg:hidden' },
]

/**
 * `text-current` is not decoration. `NavigationMenuLink` pins every icon inside
 * it to `--muted-foreground` with `[&_svg:not([class*='text-'])]`, so these two
 * kept a fixed grey while the label beside them changed — over the hero
 * photograph the magnifier sat at a washed 0.43 lightness and never moved. A
 * class containing `text-` is what the selector excludes, and `text-current` is
 * the one that also says the right thing: follow the label.
 *
 * `transition-transform` rather than `transition` for the same reason the header
 * does not transition its own colour: with a duration of their own these icons
 * chase a value that is still moving and land after the word they belong to.
 * With none, the inherited colour tracks the label exactly.
 */
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
          className="relative top-px ml-1 h-4 w-4 text-current transition-transform duration-200"
          aria-hidden="true"
        />
      ) : isExternal ? (
        <ExternalLinkIcon
          className="relative top-px ml-1 h-4 w-4 text-current transition-transform duration-200"
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
