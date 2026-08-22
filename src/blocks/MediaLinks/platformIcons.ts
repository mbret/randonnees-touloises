import type { LucideIcon } from 'lucide-react'

import { Images, Link2, Youtube } from 'lucide-react'

import type { MediaPlatform } from './platforms'

/**
 * The icon each platform draws.
 *
 * Kept apart from the block config, which the admin bundles: the config needs
 * only the names and their labels, while this — and the icons it pulls in — is
 * the renderer's business.
 */
export const mediaPlatformIcons: Record<MediaPlatform, LucideIcon> = {
  googlePhotos: Images,
  youtube: Youtube,
  other: Link2,
}
