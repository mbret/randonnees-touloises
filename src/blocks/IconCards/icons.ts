/**
 * The icons a card may carry, by the value stored on it.
 *
 * A fixed list rather than a free-text lucide name: an icon has to be imported
 * to be rendered, so only what is named here can be in the bundle, and any
 * other value could render as nothing at all.
 *
 * Labels are what the editor picks from, so they read as the thing pictured
 * rather than as the name of a component.
 *
 * This file deliberately imports nothing, so the config can name every option
 * without pulling an icon in. The icons themselves live in `iconComponents`,
 * keyed by `CardIcon` so leaving one out is a type error rather than a blank
 * card, and are loaded by the renderer and by the field preview — which is an
 * admin component, so the admin does carry them.
 */
export const cardIconLabels = {
  compass: 'Boussole',
  handshake: 'Poignée de main',
  users: 'Groupe',
  map: 'Carte',
  calendar: 'Calendrier',
  shield: 'Sécurité',
  mountain: 'Montagne',
  footprints: 'Empreintes',
} as const

export type CardIcon = keyof typeof cardIconLabels

export const cardIconOptions = Object.entries(cardIconLabels).map(([value, label]) => ({
  label,
  value,
}))
