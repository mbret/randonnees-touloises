import * as React from "react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/components/ui/utils/index"

/**
 * A pill for picking among a few peers — a month, a filter, a kind of walk.
 *
 * A chip is a small round button that knows whether it is the one currently
 * chosen, so the pair of states lives here rather than at every call site.
 * `selected` is presentation only: the caller still says what being chosen
 * means — `aria-selected` on a tab, `aria-pressed` on a toggle.
 *
 * The selected state wears a transparent border because the outline state
 * has a real one and the filled state none: without it, picking a chip would
 * grow it by a pixel a side and shove its neighbours.
 */
function Chip({
  className,
  selected = false,
  type = "button",
  ...props
}: React.ComponentProps<"button"> & { selected?: boolean }) {
  return (
    <button
      data-slot="chip"
      className={cn(
        buttonVariants({ size: "sm", variant: selected ? "default" : "outline" }),
        "rounded-full",
        selected && "border border-transparent",
        className
      )}
      type={type}
      {...props}
    />
  )
}

export { Chip }
