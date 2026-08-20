import type { CollectionBeforeValidateHook } from 'payload'

import type { Post } from '@/payload-types'

/**
 * Roughly what a search engine shows before it truncates. Past this the rest of
 * the sentence is cut anyway, so the fallback stops here rather than pasting a
 * paragraph into the field.
 */
const DESCRIPTION_LENGTH = 155

/** Every string in a lexical subtree, in reading order. */
const textOf = (node: unknown): string => {
  if (!node || typeof node !== 'object') return ''

  const { children, root, text } = node as { children?: unknown[]; root?: unknown; text?: unknown }

  if (typeof text === 'string') return text
  if (root) return textOf(root)

  return Array.isArray(children) ? children.map(textOf).join(' ') : ''
}

/**
 * A post's body as a meta description: the text it holds, collapsed onto one
 * line and cut to what a search engine will show. Exported so the importers
 * describe their posts the same way the editor does.
 */
export const summarise = (content: unknown): string => {
  const text = textOf(content).replace(/\s+/g, ' ').trim()

  if (text.length <= DESCRIPTION_LENGTH) return text

  return `${text.slice(0, DESCRIPTION_LENGTH - 1).trimEnd()}…`
}

/**
 * Fills the SEO fields from the post itself whenever they are left empty.
 *
 * `meta.title` and `meta.description` are required, which alone would only move
 * the problem: an author who does not care fills them with anything to get past
 * the validation. Deriving them first means the fields arrive already right and
 * editable, and the requirement only ever fires when there is genuinely nothing
 * to derive from — an untitled post with an empty body.
 *
 * Without this, an empty `meta.title` gives every post the same title tag, since
 * `generateMeta` falls back to the site title on its own.
 */
export const fillMeta: CollectionBeforeValidateHook<Post> = ({ data, originalDoc }) => {
  if (!data) return data

  const title = data.title ?? originalDoc?.title
  const content = data.content ?? originalDoc?.content
  const heroImage = data.heroImage ?? originalDoc?.heroImage
  const meta = { ...(data.meta ?? {}) }

  if (!meta.title && title) meta.title = title

  if (!meta.description && content) {
    const description = summarise(content)

    if (description) meta.description = description
  }

  if (!meta.image && heroImage) meta.image = heroImage

  return { ...data, meta }
}
