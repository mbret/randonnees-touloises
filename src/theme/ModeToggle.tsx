'use client'

/**
 * Parked, not dead. Its use in the footer is commented out while the site is
 * forced light — the reasoning is at the `ThemeProvider` in
 * `app/(frontend)/layout.tsx` — but the dark palette it switches to is still
 * maintained, so this stays ready rather than being deleted and rewritten
 * later. Uncommenting that block and its import puts it back in the footer's
 * first column.
 */

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Changer de thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Clair</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Sombre</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>Système</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
