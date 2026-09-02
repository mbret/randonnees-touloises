'use client'

import React, { useState } from 'react'

import { CMSLink } from '@/components/Link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ChevronRightIcon, ExternalLinkIcon, MenuIcon, SearchIcon } from 'lucide-react'
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Logo } from '@/components/Logo/Logo'
import type { OrderedNavItem } from './staticNavItems'

export const MobileNav: React.FC<{ navItems: OrderedNavItem[] }> = ({ navItems }) => {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* A word with a mark, not a filled button. Filled, it was the heaviest
          thing in the header — the weight a call to action gets, spent on the
          menu toggle — and on the home page it had to invert as the bar changed
          state, flipping cream-on-brown to brown-on-cream while the links
          beside it only changed colour. As a ghost it changes the way they do.
          The word stays: a bare mark asks the reader to know the convention,
          and this club's members are not the people to spend that on. */}
      <SheetTrigger asChild>
        <Button className="sm:hidden" variant="ghost">
          <MenuIcon aria-hidden="true" />
          Menu
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader className="items-start">
          <SheetTitle className="sr-only">Edit profile</SheetTitle>
          <Logo className="max-h-10 w-auto" />
        </SheetHeader>
        <nav className="gap-3 flex flex-col overflow-y-auto p-4">
          {navItems.map(({ link }, i) => {
            return (
              <Item asChild key={i}>
                <CMSLink
                  {...link}
                  appearance="inline"
                  label={undefined}
                  onClick={() => setOpen(false)}
                >
                  {/* TODO: Add a search icon to the search link */}
                  {link.url === '/search' && (
                    <ItemMedia>
                      <SearchIcon className="size-4" />
                    </ItemMedia>
                  )}
                  <ItemContent>
                    <ItemTitle>{link.label}</ItemTitle>
                  </ItemContent>
                  <ItemActions>
                    {link.isExternal ? (
                      <ExternalLinkIcon className="size-4" />
                    ) : (
                      <ChevronRightIcon className="size-4" />
                    )}
                  </ItemActions>
                </CMSLink>
              </Item>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
