/**
 * Where a media link points, by the value stored on it.
 *
 * The club hosts none of this itself: photos live in shared Google Photos
 * albums and videos on the association's YouTube channel. The platform is
 * therefore what an entry is, not merely how it looks — it decides the icon,
 * the wording of the card's action, and what an editor is expected to paste.
 *
 * This file deliberately imports nothing, so the config can name every option
 * without pulling an icon in. The icons live in `platformIcons`, keyed by
 * `MediaPlatform` so leaving one out is a type error rather than a blank card.
 */
export const mediaPlatformLabels = {
  googlePhotos: 'Album Google Photos',
  youtube: 'YouTube',
  other: 'Autre',
} as const

export type MediaPlatform = keyof typeof mediaPlatformLabels

export const mediaPlatformOptions = Object.entries(mediaPlatformLabels).map(([value, label]) => ({
  label,
  value,
}))

/** What the card's action reads as, so a video does not say "voir l'album". */
export const mediaPlatformActions: Record<MediaPlatform, string> = {
  googlePhotos: 'Voir l’album',
  youtube: 'Voir sur YouTube',
  other: 'Ouvrir le lien',
}
