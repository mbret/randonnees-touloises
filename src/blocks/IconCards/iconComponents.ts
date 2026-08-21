import type { LucideIcon } from 'lucide-react'

import {
  Calendar,
  Compass,
  Footprints,
  HeartHandshake,
  Map,
  Mountain,
  Shield,
  Users,
} from 'lucide-react'

import type { CardIcon } from './icons'

/**
 * The icon each stored name draws.
 *
 * Typed against `CardIcon`, so adding a name to `cardIconLabels` without an
 * icon here is a build error rather than a card that renders blank.
 *
 * Kept apart from the block config, which the admin bundles: the config needs
 * only the names and their labels, while this — and the icons it pulls in — is
 * needed by the renderer and by the field preview.
 */
export const iconComponents: Record<CardIcon, LucideIcon> = {
  calendar: Calendar,
  compass: Compass,
  footprints: Footprints,
  handshake: HeartHandshake,
  map: Map,
  mountain: Mountain,
  shield: Shield,
  users: Users,
}
