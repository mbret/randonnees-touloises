'use client'

import clsx from 'clsx'
import React from 'react'

import { ImagePlaceholder } from '@/components/common/ImagePlaceholder'
import { useMedias } from '@/metadata/MediaProvider'
import { getMediaUrl } from '@/utilities/getMediaUrl'

/**
 * The federation's badge, uploaded to the media library under the filename
 * `federation` — the club is licensed to display it, so it belongs to the
 * site's content rather than to the repository.
 *
 * The placeholder stands in until it is uploaded: the badge sits inside the
 * link naming the federation, and rendering nothing would leave that link
 * looking like a stray line of text with no hint that an image is missing.
 */
export const FederationLogo = ({ className }: { className?: string }) => {
  const { media } = useMedias()
  const logo = media?.find((m) => m.filename === 'federation')

  if (!logo?.url)
    return <ImagePlaceholder className={clsx('h-12', className)} label="Logo FFRandonnée" />

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      alt=""
      className={clsx('h-12 w-auto object-contain', className)}
      decoding="async"
      height={logo.height || undefined}
      loading="lazy"
      src={getMediaUrl(logo.url, logo.updatedAt)}
      width={logo.width || undefined}
    />
  )
}
