/**
 * One node of structured data, as loose as JSON-LD itself: a `@type` and
 * whatever properties that type takes.
 */
export type JsonLdNode = {
  '@context'?: string
  '@type': string
  [key: string]: unknown
}

/**
 * A node as the text of a script block.
 *
 * `JSON.stringify` does not escape markup, so a `</script>` typed into a title
 * or a meta description would close the block early and spill the rest of the
 * payload into the page as HTML. Escaping `<` keeps every character inside the
 * script, and is what the Next.js JSON-LD guide prescribes.
 */
export const serializeJsonLd = (data: JsonLdNode) => JSON.stringify(data).replace(/</g, '\\u003c')
