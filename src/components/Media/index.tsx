import React, { Fragment } from 'react'

import type { ImageMediaProps, VideoMediaProps } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'

export const Media: React.FC<ImageMediaProps | VideoMediaProps> = (props) => {
  const { className, htmlElement = 'div', resource } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const Tag = htmlElement || Fragment

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className,
          }
        : {})}
    >
      {isVideo ? (
        <VideoMedia {...(props as VideoMediaProps)} />
      ) : (
        <ImageMedia {...(props as ImageMediaProps)} />
      )}
    </Tag>
  )
}
