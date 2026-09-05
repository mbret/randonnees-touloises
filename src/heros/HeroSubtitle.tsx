import React from 'react'

import { cn } from '@/components/ui'

/**
 * The sentence under a page's title.
 *
 * Sized and coloured to match what the coded pages produced before them —
 * `<p className="lead">` inside `prose`, which the typography plugin renders at
 * 1.25em over `--tw-prose-lead`. `globals.css` binds that variable to
 * `--muted-foreground`, so naming the token directly here is the same colour by
 * a shorter route, and it follows the theme the same way. It sits outside the
 * rich text and so outside `prose`, where the plugin's own rule could not reach
 * it anyway.
 *
 * Spacing is left to the caller: each hero already spaces its own parts, and the
 * strapline belongs nearer the title than to whatever follows it.
 */
export const HeroSubtitle: React.FC<{ children?: null | string; className?: string }> = ({
  children,
  className,
}) =>
  children ? (
    <p className={cn('text-muted-foreground text-xl leading-[1.6]', className)}>{children}</p>
  ) : null
