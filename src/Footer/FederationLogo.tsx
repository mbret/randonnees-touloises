'use client'

import { ImageMedia } from '@/components/Media/ImageMedia'
import { useTheme } from '@/providers/Theme'

export const FederationLogo = ({ className }: { className?: string }) => {
  const { media } = useTheme()

  return (
    <ImageMedia
      resource={media?.find((m) => m.filename === 'federation')}
      unoptimized
      imgClassName="max-h-12"
    />
  )
}
