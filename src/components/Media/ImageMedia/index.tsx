'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/components/ui'
import NextImage from 'next/image'
import React, { ComponentProps } from 'react'

import type { Media as MediaType } from '@/payload-types'

import type { ImageMediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

// A base64 encoded image to use as a placeholder while the image is loading
const placeholderBlur =
  'data:image/png;base64,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'

/**
 * The size below which asking for a transformation costs more than it saves.
 *
 * A transformation is billed per distinct combination of source URL, width,
 * quality and `Accept` header, and the result is kept for at most 31 days — so
 * one upload is not one charge but one per width the layout asks for, times the
 * formats visitors' browsers accept, renewed monthly.
 *
 * Ten kilobytes is the floor Vercel itself gives for this. Only nine of the
 * club's 249 uploads sit under it, so this is not where the saving is — but
 * they are the ones the optimiser worked hardest to no purpose:
 * `logo-nordic-outing.png` is 4 kB and came back 19% smaller, having been
 * transformed 18 times to manage it. Below the floor the saving is rounding
 * error against the fixed cost of holding another variant.
 */
const OPTIMISATION_FLOOR_BYTES = 10 * 1024

/**
 * Types no raster transformation improves: an SVG is already the vector the
 * optimiser would be flattening, and a GIF loses its animation on the way
 * through. Next opts SVG out by itself, but only when `src` ends in `.svg` —
 * ours never does, because `getMediaUrl` stamps a `?v=` cache tag onto every
 * URL it builds.
 */
const UNOPTIMISABLE_TYPES = new Set(['image/gif', 'image/svg+xml'])

const notWorthOptimising = ({ filesize, mimeType }: MediaType) =>
  UNOPTIMISABLE_TYPES.has(mimeType ?? '') ||
  (typeof filesize === 'number' && filesize <= OPTIMISATION_FLOOR_BYTES)

export const ImageMedia: React.FC<
  ImageMediaProps & Omit<ComponentProps<typeof NextImage>, 'resource' | 'alt' | 'src'>
> = (props) => {
  const {
    alt: altFromProps,
    fill,
    pictureClassName,
    className,
    imgClassName,
    priority,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    loading: loadingFromProps,
    ...rest
  } = props

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''
  let unoptimized = false

  if (!src && resource && typeof resource === 'object') {
    const { alt: altFromResource, height: fullHeight, url, width: fullWidth } = resource

    width = fullWidth!
    height = fullHeight!
    alt = altFromResource || ''

    const cacheTag = resource.updatedAt

    src = getMediaUrl(url, cacheTag)
    unoptimized = notWorthOptimising(resource)
  }

  const loading = loadingFromProps || (!priority ? 'lazy' : undefined)

  /**
   * What the browser is told the image renders at, and the most expensive prop
   * here: `sizes` is what makes Next offer the whole `deviceSizes` +
   * `imageSizes` srcset instead of the intrinsic width at 1x and 2x, and every
   * width a browser picks off that list is a transformation of its own.
   *
   * So it is passed through when a caller knows the rendered size, set to the
   * viewport for a `fill` image — which really is as wide as its container —
   * and otherwise left off, which is the honest answer for an image rendered at
   * its own width and the cheap one.
   *
   * What this replaces was built from the breakpoints in descending order and
   * written with `w` descriptors. Those belong to `srcset`; `sizes` takes CSS
   * lengths, so every entry was invalid, and a browser that cannot parse any of
   * them falls back to `100vw` — which is how thumbnails came to be served the
   * widest file on offer.
   */
  const sizes = sizeFromProps ?? (fill ? '100vw' : undefined)

  return (
    <picture className={cn(pictureClassName)}>
      <NextImage
        alt={alt || ''}
        className={cn(className, imgClassName)}
        fill={fill}
        height={!fill ? height : undefined}
        placeholder="blur"
        blurDataURL={placeholderBlur}
        priority={priority}
        loading={loading}
        sizes={sizes}
        src={src}
        unoptimized={unoptimized}
        width={!fill ? width : undefined}
        {...rest}
      />
    </picture>
  )
}
