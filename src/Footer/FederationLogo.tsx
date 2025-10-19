'use client'

import { ImageMedia } from '@/components/Media/ImageMedia'
import { useMedias } from '@/metadata/MediaProvider'

export const FederationLogo = ({ className }: { className?: string }) => {
  const { media } = useMedias()

  return (
    <ImageMedia
      resource={media?.find((m) => m.filename === 'federation')}
      unoptimized
      imgClassName="max-h-12"
    />
  )
}
