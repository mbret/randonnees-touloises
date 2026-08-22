'use client'
import type { MediaLinksBlock } from '@/payload-types'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

import { mediaPlatformLabels, type MediaPlatform } from './platforms'

/**
 * Rows start collapsed, so the label is all an editor has to find the album
 * they came to change. The title alone would leave a list of names with no way
 * to tell a video from a set of photos, hence the platform beside it.
 */
export const RowLabel: React.FC<RowLabelProps> = () => {
  const { data, rowNumber } = useRowLabel<NonNullable<MediaLinksBlock['items']>[number]>()

  const position = rowNumber !== undefined ? `${rowNumber + 1}. ` : ''
  const platform = mediaPlatformLabels[data?.platform as MediaPlatform]

  if (!data?.title) return <div>{`${position}Lien`}</div>

  return <div>{`${position}${data.title}${platform ? ` — ${platform}` : ''}`}</div>
}
