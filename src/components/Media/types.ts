import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Media as MediaType } from '@/payload-types'

export interface Props {
  alt?: string
  className?: string
  fill?: boolean // for NextImage only
  htmlElement?: ElementType | null
  onClick?: () => void
  onLoad?: () => void
  loading?: 'lazy' | 'eager' // for NextImage only
  priority?: boolean // for NextImage only
  resource?: MediaType | string | number | null // for Payload media
  size?: string // for NextImage only
  src?: StaticImageData // for static media
}

export interface ImageMediaProps extends Omit<Props, 'ref'> {
  ref?: Ref<HTMLImageElement | null>
  pictureClassName?: string
  imgClassName?: string
}

export interface VideoMediaProps extends Omit<Props, 'ref'> {
  ref?: Ref<HTMLVideoElement | null>
  videoClassName?: string
}
