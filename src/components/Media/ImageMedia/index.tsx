'use client'

import { cn } from '@/components/ui'
import React, { ComponentProps, CSSProperties } from 'react'

import type { Media as MediaType } from '@/payload-types'

import type { ImageMediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

/**
 * The generated sizes that make a width ladder, narrowest first.
 *
 * `square` is a centre crop rather than a scaled copy, so it cannot sit on a
 * `srcset` beside sizes of the upload's own shape, and `og` is the social
 * card's. What is left is what Payload builds for every upload: 300, 600, 900,
 * 1400 and 1920, in WebP.
 */
const LADDER = ['thumbnail', 'small', 'medium', 'large', 'xlarge'] as const

type GeneratedSize = NonNullable<NonNullable<MediaType['sizes']>[(typeof LADDER)[number]]>

const isUsable = (size: GeneratedSize | null | undefined): size is GeneratedSize =>
  Boolean(size?.url && size?.width)

/**
 * The ladder as a `srcset`, or nothing when the upload has no rungs.
 *
 * Payload skips a size wider than the original rather than enlarging it, and
 * generates none at all for a vector, so what comes back is a photograph's five
 * rungs, a small logo's one, or nothing. Offering what exists covers all three:
 * an empty `srcset` leaves the `<img>` below to serve the original, which is
 * also what a browser too old for WebP is served.
 *
 * Every rung carries the document's `updatedAt`, the cache tag `getMediaUrl`
 * stamps on the original too — the sizes are regenerated with it, so one
 * revision addresses them all.
 */
const srcSetFor = (resource: MediaType) =>
  LADDER.map((name) => resource.sizes?.[name])
    .filter(isUsable)
    .map((size) => `${getMediaUrl(size.url, resource.updatedAt)} ${size.width}w`)
    .join(', ')

/**
 * What `next/image`'s `fill` did, written out.
 *
 * It is the whole of that prop's behaviour: the image is taken out of flow and
 * stretched over the nearest positioned ancestor, which is what lets a hero
 * sit behind its own text. The callers that pass `fill` rely on the ancestor
 * they already position themselves.
 */
const FILL_STYLE: CSSProperties = { height: '100%', inset: 0, position: 'absolute', width: '100%' }

export const ImageMedia: React.FC<
  /* `resource` is omitted because React types it as the RDFa attribute of that
     name, a `string`, which intersects with our own prop down to nothing. */
  ImageMediaProps & Omit<ComponentProps<'img'>, 'alt' | 'ref' | 'resource' | 'sizes' | 'src'>
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
    style: styleFromProps,
    loading: loadingFromProps,
    ...rest
  } = props

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src = ''
  let srcSet = ''

  if (srcFromProps) {
    /* A static import is already hashed, sized and served immutable by Next, so
     * it needs no ladder and no optimiser — only unwrapping. */
    src = srcFromProps.src
    width = srcFromProps.width
    height = srcFromProps.height
  } else if (resource && typeof resource === 'object') {
    const { alt: altFromResource, height: fullHeight, url, width: fullWidth } = resource

    width = fullWidth ?? undefined
    height = fullHeight ?? undefined
    alt = altFromResource || ''
    src = getMediaUrl(url, resource.updatedAt)
    srcSet = srcSetFor(resource)
  }

  const loading = loadingFromProps ?? (priority ? 'eager' : 'lazy')

  /**
   * What the browser is told the image renders at.
   *
   * It cannot work this out for itself: the choice is made before layout, so
   * without being told, a browser assumes the image is as wide as the viewport
   * and takes the widest rung on offer for a 200px card. Callers that know
   * their rendered width say so — see the `IMAGE_SIZES` beside the layouts
   * that do — and `100vw` is the honest answer for the rest, which are
   * full-bleed.
   */
  const sizes = sizeFromProps ?? '100vw'

  return (
    <picture className={cn(pictureClassName)}>
      {/* The ladder is WebP, so it is offered by type rather than as the
          `<img>`'s own `srcset`: a browser that cannot decode WebP skips the
          source and takes the original below, which is left in the format it
          was uploaded in for exactly that reason. */}
      {srcSet && <source sizes={sizes} srcSet={srcSet} type="image/webp" />}
      <img
        alt={alt || ''}
        className={cn(className, imgClassName)}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        height={!fill ? height : undefined}
        loading={loading}
        sizes={sizes}
        src={src}
        style={fill ? { ...FILL_STYLE, ...styleFromProps } : styleFromProps}
        width={!fill ? width : undefined}
        {...rest}
      />
    </picture>
  )
}
