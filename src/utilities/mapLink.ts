/** A pin, as the two numbers everything else is derived from. */
export type Pin = { latitude?: null | number; longitude?: null | number }

/**
 * A link to a place on a map, from its coordinates.
 *
 * A plain URL rather than an embedded map: an embed needs a key, a script and a
 * tile budget to show what a walker looks at once, the evening before, to work
 * out whether they know the car park. The link opens whatever they already use,
 * which on a phone is usually their own map app rather than a browser tab.
 *
 * `?api=1&query=` is Google's documented, stable form for « show me this point »
 * — unlike the `maps.app.goo.gl` shortener the club has been pasting, which is
 * opaque, unstable and outlived by nothing: `goo.gl` proper was switched off in
 * 2025. Nothing here depends on that shortener any more.
 */
export const mapUrl = ({ latitude, longitude }: Pin): string | undefined =>
  typeof latitude === 'number' && typeof longitude === 'number'
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : undefined
