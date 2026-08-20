/**
 * The one way a stored description reaches the public side of the site.
 *
 * A post's `meta.description` is not only the meta tag: it is the OpenGraph
 * description, the `Event.description` in the JSON-LD, the row the search plugin
 * indexes, and the line printed under every card in a listing. Five readers, one
 * value — so one contact detail written into it is published five times over.
 *
 * The guard therefore sits on the read rather than on whatever wrote the value.
 * Nothing has to have gone right earlier: a row an importer wrote before this
 * existed, a description an editor typed by hand, a body summary that slipped
 * through — all of them pass through here on the way out, and none of them needs
 * a migration to be safe. `publicDescription` is the accessor every consumer
 * calls; nothing else reads `meta.description` for public output.
 */

/** An email address, in the shapes a member would type one into a body. */
const emailPattern = /[\w.!#$%&'*+/=?^_`{|}~-]+@[\w-]+(?:\.[\w-]+)+/g

/**
 * A number written the international way. Anything holding at least eight digits
 * behind a `+` prefix is a phone number: nothing else the club writes starts that
 * way, so this one can afford to be loose about how the rest is spaced.
 */
const internationalPhonePattern = /\+\d{1,3}(?:[\s.-]?\(0\))?(?:[\s.-]?\d){7,}/g

/**
 * A number written the French way: `0X` and then four pairs, held together by one
 * separator used throughout — a space, a dot, a dash — or by none at all.
 *
 * The separator is captured and back-referenced so that a run of digits which
 * merely looks like a number is left alone: `01.02.2026` is a date, and the year
 * inside it carries no separator, so the pattern stops before it. The eight-digit
 * form is matched as well, since a description cut to its 155 characters can end
 * mid-number and half a phone number is still a phone number.
 *
 * The character in front is matched and put back rather than checked with a
 * lookbehind: this module renders listing cards in the browser as well, and a
 * lookbehind is a syntax error on the iPads some of the club still reads the
 * programme on.
 */
const frenchPhonePattern = /(^|[^\d])0[1-9]([\s.-]?)\d{2}\2\d{2}\2\d{2}(?:\2\d{2})?(?!\d)/g

/**
 * A number the truncation cut in two, which the pattern above can no longer
 * recognise — three digits of a phone number are not a shape. Anchored to the end
 * of the string, where a cut is the only thing that can have left one.
 */
const truncatedPhonePattern = /(^|[^\d])0[1-9]([\s.-]?)\d{2}(?:\2\d{1,2})*\s*…?\s*$/

/**
 * One line, with nothing dangling. The whitespace collapse also settles the
 * non-breaking spaces a French keyboard leaves before punctuation, and the tail
 * trim clears a separator whose other half has just been removed — a
 * `Renseignements :` with nothing after it now.
 */
const tidy = (text: string) =>
  text
    .replace(/\s+/g, ' ')
    .replace(/[\s,;:·—–-]+$/, '')
    .trim()

/**
 * The same text with the contact details taken out of it.
 *
 * Exported for its tests and for `summarise`, which needs to redact before it
 * truncates; everything else should go through `publicDescription`.
 */
export const redactContacts = (text: string): string =>
  tidy(
    text
      .replace(emailPattern, '')
      .replace(internationalPhonePattern, '')
      .replace(frenchPhonePattern, '$1')
      .replace(truncatedPhonePattern, '$1'),
  )

/**
 * The description a document publishes. Returns nothing when there is nothing
 * left to say, which every consumer already handles: a missing description is a
 * state the site has always had to render.
 */
export const publicDescription = (
  meta?: { description?: string | null } | null,
): string | undefined => {
  const description = meta?.description

  if (!description) return undefined

  return redactContacts(description) || undefined
}
