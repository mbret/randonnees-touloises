/**
 * The kinds of line a formula card may carry, by the value stored on one.
 *
 * A formula is not a list of features: three different things are being said
 * under the price, and reading them as one bulleted run is what made the old
 * site's cards hard to skim. Who the formula is for, what it takes off the
 * price, and what has to be handed over with the form are separate claims, so
 * each gets its own mark and its own weight.
 *
 * Labels are what the editor picks from, so they name the claim rather than the
 * icon that draws it.
 *
 * This file imports nothing, so the block config can name every option without
 * pulling an icon into the bundle. The icons live in `lineIcons`, keyed by
 * `TierLineKind` so leaving one out is a type error rather than a blank line.
 */
export const tierLineLabels = {
  condition: 'Vous concerne si…',
  discount: 'Remise',
  requirement: 'À fournir',
} as const

export type TierLineKind = keyof typeof tierLineLabels

export const tierLineOptions = Object.entries(tierLineLabels).map(([value, label]) => ({
  label,
  value,
}))
