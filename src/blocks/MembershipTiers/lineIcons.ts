import { BadgePercent, Check, FileHeart, type LucideIcon } from 'lucide-react'

import type { TierLineKind } from './lines'

/**
 * Keyed by kind rather than chosen by the editor: the mark is what tells a
 * condition from a remise at a glance, so it has to be the same mark on every
 * card. An editor picking it per line is how four cards stop agreeing.
 */
export const tierLineIcons: Record<TierLineKind, LucideIcon> = {
  condition: Check,
  discount: BadgePercent,
  requirement: FileHeart,
}
