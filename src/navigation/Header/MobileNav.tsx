'use client'

import React, { useState } from 'react'


import { CMSLink } from '@/components/Link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ChevronRightIcon, ExternalLinkIcon, SearchIcon } from 'lucide-react'
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Logo } from '@/components/Logo/Logo'
import type { HeaderNavItem } from './staticNavItems'

export const MobileNav: React.FC<{ navItems: HeaderNavItem[] }> = ({ navItems }) => {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="sm:hidden">Menu</Button>
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
