import { getServerSideURL } from '../utilities/getURL'

/**
 * A site-relative path as the absolute URL structured data needs.
 *
 * Social tags tolerate a relative URL because `metadataBase` resolves them;
 * JSON-LD has no such base, so every `url`, `@id` and image inside it has to
 * carry the origin itself.
 *
 * A URL that already carries an origin is returned untouched: media served by a
 * storage adapter comes back absolute, and prefixing it a second time would
 * point every picture at a path that does not exist.
 */
export const absoluteUrl = (path: string) =>
  /^https?:\/\//i.test(path) ? path : `${getServerSideURL()}${path}`
