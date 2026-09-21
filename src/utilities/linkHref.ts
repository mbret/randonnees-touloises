/**
 * Collections served from the site root, whose documents answer at `/slug`
 * rather than `/collection/slug`.
 */
const servedFromRoot: string[] = ['globalPages', 'pages']

export type LinkLike = {
  reference?: { relationTo: string; value: unknown } | null
  type?: ('reference' | 'custom') | null
  url?: string | null
}

/**
 * A slug with the separator it is about to be joined with taken off the front.
 *
 * `globalPages` slugs are typed by hand into a field whose label says « URL »,
 * so they get typed as addresses: `/#agenda` rather than `#agenda`. Joined
 * naively that reads `//#agenda`, which a browser parses as a protocol-relative
 * address with no host — not a fragment on this site — and the link goes
 * nowhere. Trimming makes the two spellings the one address they were meant to
 * be, and leaves a slug of `/` as the site root rather than as `//`.
 */
const withoutLeadingSlashes = (slug: string) => slug.replace(/^\/+/, '')

const slugOf = (value: unknown): string | null => {
  if (!value || typeof value !== 'object' || !('slug' in value)) return null

  const { slug } = value as { slug?: unknown }

  return typeof slug === 'string' && slug ? slug : null
}

/**
 * Where a link points, whether it names an address or references a document.
 *
 * One definition, shared by the component that renders a link and the code that
 * decides two links are the same link. A second definition is how a reference
 * and a plain address pointing at one page stop recognising each other as
 * duplicates — and `reference` is the default type, so that is the common case,
 * not the exotic one.
 *
 * A reference resolves only once its document is populated, which needs the
 * query to have asked for a depth of at least 1. Unresolved, it falls back to
 * the address field, exactly as rendering does.
 */
export const linkHref = ({ reference, type, url }: LinkLike): string | null => {
  if (type === 'reference' && reference) {
    const slug = slugOf(reference.value)

    if (slug) {
      const prefix = servedFromRoot.includes(reference.relationTo) ? '' : `/${reference.relationTo}`

      return `${prefix}/${withoutLeadingSlashes(slug)}`
    }
  }

  return url ?? null
}
