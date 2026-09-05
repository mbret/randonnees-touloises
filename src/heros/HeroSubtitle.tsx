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
 *
 * The low-impact hero asks for `mt-8`, and 32px is not a guess. In the coded
 * pages the title and the strapline were siblings inside one `prose`, so the
 * gap was the `h1`'s own `margin-bottom` — `0.8888889em` of 36px — collapsing
 * with the lead's smaller `margin-top`. Here the title is the last child of the
 * rich text's `prose`, where the plugin zeroes `margin-bottom`, and the
 * strapline is outside it; so nothing collapses and this margin is the whole
 * distance. `mt-4` left it at half, which is how it was noticed.
 */
export const HeroSubtitle: React.FC<{ children?: null | string; className?: string }> = ({
  children,
  className,
}) =>
  children ? (
    <p className={cn('text-muted-foreground text-xl leading-[1.6]', className)}>{children}</p>
  ) : null
