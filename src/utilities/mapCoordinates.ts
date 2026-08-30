/** A pin, as the two numbers everything else can be derived from. */
export type Coordinates = { latitude: number; longitude: number }

/**
 * Where a pair of numbers can hide in the things people paste.
 *
 * Order is precedence, and it matters. A Google « place » link carries the
 * marker twice: `@lat,lng` is where the *camera* sits — for a Street View link
 * that is the pavement the photograph was taken from — while `!3d…!4d…` is the
 * place itself. The club's own links disagree by around twenty-five metres
 * between the two, so the marker is read first and the camera only stands in
 * when there is no marker to read.
 */
const PATTERNS = [
  /* An explicit parameter says what it is, so it beats anything positional. */
  /[?&](?:q|query|ll|daddr|center)=(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/,
  /* The marker on a Google « place » URL. */
  /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  /* google.com/maps/search/48.742468, 5.758898 — what a resolved short link is. */
  /\/search\/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/,
  /* The camera, as a last resort. */
  /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /* geo:48.74,5.75 — what a phone hands over when you share a pin. */
  /^geo:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  /* Someone typing the pair straight in, which is the whole of what we store. */
  /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/,
]

/** Rejects a pair that is not a place on Earth — a swapped or truncated paste. */
const onEarth = (latitude: number, longitude: number): Coordinates | null =>
  Number.isFinite(latitude) &&
  Number.isFinite(longitude) &&
  Math.abs(latitude) <= 90 &&
  Math.abs(longitude) <= 180
    ? { latitude, longitude }
    : null

/**
 * The pin in a map URL or a typed pair, or `null` when there is none to find.
 *
 * Deliberately forgiving about *what* is pasted, because the club's own links
 * are three different shapes already — a coordinate search, a Street View place
 * link, a bare pair copied out of a phone — and the person pasting has no way to
 * tell which one they are holding.
 *
 * It cannot follow a `maps.app.goo.gl` short link: that needs a request, and the
 * coordinates only appear in what it redirects to. Resolving one is the caller's
 * job; this reads the answer.
 */
export const parseCoordinates = (input?: null | string): Coordinates | null => {
  if (!input) return null

  let text = input.trim()

  try {
    text = decodeURIComponent(text)
  } catch {
    /* A stray percent is not a reason to give up on the rest of the string. */
  }

  /* `+` is a space in a query string, and Google writes the pair as `lat,+lng`. */
  text = text.replace(/\+/g, ' ').trim()

  for (const pattern of PATTERNS) {
    const match = pattern.exec(text)

    if (match) {
      const found = onEarth(Number(match[1]), Number(match[2]))

      if (found) return found
    }
  }

  return null
}
