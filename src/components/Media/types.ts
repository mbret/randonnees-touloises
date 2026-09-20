import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Media as MediaType } from '@/payload-types'

export interface Props {
  alt?: string
  className?: string
  fill?: boolean // stretches the image over the ancestor its caller positions
  htmlElement?: ElementType | null
  onClick?: () => void
  onLoad?: () => void
  loading?: 'lazy' | 'eager'
  priority?: boolean // loads eagerly, at high fetch priority
  resource?: MediaType | string | number | null // for Payload media
  size?: string // what the image renders at, for the browser to pick a rung with
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
