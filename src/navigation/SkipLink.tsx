import React from 'react'

/**
 * The name the skip link points at and the name the landmark answers to, kept
 * in one place. A link to a `#contenu` no element carries is silent — the
 * browser moves nothing, and the visitor is left tabbing the menu again, which
 * is the one thing this exists to spare them.
 */
export const MAIN_CONTENT_ID = 'contenu'

/**
 * The first thing in the tab order, out of sight until it is focused.
 *
 * Without it, every keyboard and screen-reader visitor pays for the whole
 * header — the logo and eight or more menu entries — before reaching the page,
 * on every page, with no way past.
 *
 * Held off-screen by a transform rather than by `sr-only`, which would have to
 * be undone on focus: the hiding rules and the revealing ones then disagree
 * about `position`, and which of them wins comes down to the order Tailwind
 * happens to emit them in. A transform leaves the element laid out exactly as
 * it will appear and only pushes it away, so focus has nothing to do but put it
 * back.
 *
 * `top` tracks the admin bar the way the header does, so an editor's bar is not
 * what the link surfaces underneath.
 */
export function SkipLink() {
  return (
    <a
      className="bg-background text-foreground focus-visible:border-ring focus-visible:ring-ring/50 fixed top-[var(--admin-bar-height)] left-2 z-50 mt-2 -translate-y-[200%] rounded-md border px-4 py-2 text-sm font-medium shadow-lg transition-transform outline-none focus:translate-y-0 focus-visible:ring-[3px] motion-reduce:transition-none"
      href={`#${MAIN_CONTENT_ID}`}
    >
      Aller au contenu
    </a>
  )
}
