/**
 * The lexical document shape, built by hand for the seed scripts.
 *
 * A rich-text field stores what the editor's own serialiser produced, down to
 * the flags a node carries when nobody has touched it. Writing that literal
 * once here keeps a script's content readable as content, and keeps a document
 * a script creates indistinguishable from one typed into the admin — which is
 * the point, since the next person to change it will do so in the admin.
 *
 * `scripts/import-agenda.ts`, `import-programs.ts` and
 * `import-recruitment-page.ts` predate this module and still carry their own
 * copies of these helpers.
 */

/** A lexical text node, with the flags the editor expects on every one. */
export const textNode = (text: string, format = 0) => ({
  type: 'text' as const,
  detail: 0,
  format,
  mode: 'normal' as const,
  style: '',
  text,
  version: 1,
})

/** `format: 1` is the bold bit the editor sets from its own toolbar. */
export const boldNode = (text: string) => textNode(text, 1)

export type Inline = ReturnType<typeof textNode>

/** The shape every lexical node shares, as the generated types describe it. */
export type Node = { [k: string]: unknown; type: string; version: number }

export const block = <T extends string>(type: T, children: Node[], extra: object = {}) => ({
  type,
  children,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  ...extra,
})

export const paragraph = (...children: Node[]) => block('paragraph', children, { textFormat: 0 })

export const heading = (tag: 'h1' | 'h2' | 'h3', text: string) =>
  block('heading', [textNode(text)], { tag })

export const bullets = (items: string[]) =>
  block(
    'list',
    items.map((item, index) =>
      block('listitem', [textNode(item)], { checked: undefined, value: index + 1 }),
    ),
    { listType: 'bullet', start: 1, tag: 'ul' },
  )

/**
 * An inline link. `version: 3` is the link node's own, not the 1 every other
 * node here carries — the feature has its own serialiser and its own history.
 */
export const link = (text: string, url: string, newTab = false) =>
  block('link', [textNode(text)], {
    fields: { linkType: 'custom' as const, newTab, url },
    version: 3,
  })

export const richText = (...children: Node[]) => ({
  root: block('root', children),
})
