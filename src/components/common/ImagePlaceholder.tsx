import { cn } from '@/components/ui'
import { ImageIcon } from 'lucide-react'
import React from 'react'

type Props = {
  className?: string
  /** Intrinsic height in px. Omit to let the container size it. */
  height?: number
  /** Shown beside the icon and used as the accessible name. */
  label?: string
  /** Intrinsic width in px. Omit to let the container size it. */
  width?: number
}

/**
 * Stand-in for an image that is expected but has not been set in the admin.
 *
 * Rendering this rather than nothing keeps the surrounding layout — and any
 * wrapping link — intact, and makes the missing asset visible instead of
 * failing silently.
 */
export const ImagePlaceholder = ({
  className,
  height,
  label = 'Image à définir',
  width,
}: Props) => (
  <div
    aria-label={label}
    className={cn(
      'flex items-center justify-center gap-2 rounded-md border border-dashed border-muted-foreground/40 px-2 text-muted-foreground',
      className,
    )}
    role="img"
    style={{ height, width }}
  >
    <ImageIcon aria-hidden="true" className="size-4 shrink-0" />
    {label ? <span className="truncate text-xs">{label}</span> : null}
  </div>
)
