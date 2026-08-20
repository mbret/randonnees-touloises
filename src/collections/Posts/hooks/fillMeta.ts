import type { CollectionBeforeValidateHook } from 'payload'

import type { Post } from '@/payload-types'

import { redactContacts } from '@/seo/publicText'

/**
 * Roughly what a search engine shows before it truncates. Past this the rest of
 * the sentence is cut anyway, so the fallback stops here rather than pasting a
 * paragraph into the field.
 */
const DESCRIPTION_LENGTH = 155

/**
 * The lexical node types a description may quote from: the ones that hold what
 * the post says, rather than the ones that hold what it asks the reader to do.
 *
 * A whitelist rather than a list of things to skip, because the cost of the two
 * is not symmetric. An unlisted node type loses a sentence from a snippet; an
 * unforeseen one that got read publishes whatever it was carrying. A block the
 * editor gains next year should have to be named here before it can speak for the
 * post.
 */
const PROSE_TYPES = new Set(['heading', 'list', 'listitem', 'paragraph', 'quote', 'root'])

const isLink = (type: unknown) => type === 'link' || type === 'autolink'

/**
 * Every string a description may quote from a lexical subtree, in reading order.
 *
 * Two things are deliberately silent. Blocks — a Banner, a Code sample, a media
 * block — are not the post's own prose. And a link that is all its paragraph
 * holds is a button, so its label is an instruction rather than a sentence:
 * `Je m'inscris` describes nothing. A link inside a sentence keeps its text,
 * since dropping it would leave a hole in the middle of the line.
 */
const proseOf = (node: unknown, siblings = 1): string => {
  if (!node || typeof node !== 'object') return ''

  const { children, root, text, type } = node as {
    children?: unknown[]
    root?: unknown
    text?: unknown
    type?: unknown
  }

  if (root) return proseOf(root)
  if (typeof text === 'string') return text

  if (!PROSE_TYPES.has(type as string) && !(isLink(type) && siblings > 1)) return ''

  return Array.isArray(children)
    ? children.map((child) => proseOf(child, children.length)).join(' ')
    : ''
}

/**
 * A post's body as a meta description: the prose it holds, collapsed onto one
 * line, stripped of contact details and cut to what a search engine will show.
 * Exported so the importers describe their posts the same way the editor does.
 *
 * The redaction happens before the cut, not after: a phone number that has lost
 * its last two digits to the truncation no longer looks like one.
 */
export const summarise = (content: unknown): string => {
  const text = redactContacts(proseOf(content))

  if (text.length <= DESCRIPTION_LENGTH) return text

  return `${text.slice(0, DESCRIPTION_LENGTH - 1).trimEnd()}…`
}

/**
 * Fills the SEO fields from the post itself whenever they are left empty, and
 * scrubs the description whatever its origin.
 *
 * `meta.title` and `meta.description` are required, which alone would only move
 * the problem: an author who does not care fills them with anything to get past
 * the validation. Deriving them first means the fields arrive already right and
 * editable, and the requirement only ever fires when there is genuinely nothing
 * to derive from — an untitled post with an empty body.
 *
 * The scrub is not limited to the value this hook derives, because that is not
 * where the mistakes come from. A description can be typed into the SEO field by
 * hand or written straight into the row by an importer, and every one of those
 * writes arrives through this hook — so this is the last point where all of them
 * are still one value. Redacting rather than rejecting is the same argument as
 * above: a validation error the evening before an outing gets answered with a
 * full stop in the field, and then the description is gone too.
 *
 * Without this, an empty `meta.title` gives every post the same title tag, since
 * `generateMeta` falls back to the site title on its own.
 */
export const fillMeta: CollectionBeforeValidateHook<Post> = ({ data, originalDoc }) => {
  if (!data) return data

  const title = data.title ?? originalDoc?.title
  const content = data.content ?? originalDoc?.content
  const heroImage = data.heroImage ?? originalDoc?.heroImage
  const gated = data.requireContentPassword ?? originalDoc?.requireContentPassword
  const meta = { ...(data.meta ?? {}) }

  if (!meta.title && title) meta.title = title

  const stored = meta.description ? redactContacts(meta.description) : ''

  // A password-gated post describes itself with its title and nothing else:
  // `generateMeta` runs outside the gate, so a body-derived snippet would publish
  // in the meta tag, in the JSON-LD and in the search index precisely what
  // `WithContentProtectedPassword` withholds from the page.
  const derived = gated ? '' : summarise(content)

  // The title is the last resort, and it is a real one: a programme entry whose
  // body is a registration link and a poster has no prose to summarise, and its
  // title says the date and the outing.
  const description = stored || derived || (title ? redactContacts(title) : '')

  if (description) meta.description = description

  if (!meta.image && heroImage) meta.image = heroImage

  return { ...data, meta }
}
