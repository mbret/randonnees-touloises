import React from 'react'

import { cn } from '@/components/ui'

/**
 * A club figure, set the way every page that prints one sets it: the club's
 * orange, in the display face, and never broken across a line.
 *
 * Shared rather than written per page because the home band, the phone
 * sentence and the `/about` cards all say the same numbers, and a figure that
 * looked like a different kind of thing on each page would undo what putting
 * them in `keyFigures.ts` was for. The size stays with the caller: these are
 * `text-3xl` in a card and step to `text-4xl` in the band, which is a fact
 * about the space around the number rather than about the number.
 */
export function Figure({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('font-display text-brand-orange font-bold whitespace-nowrap', className)}>
      {children}
    </span>
  )
}
