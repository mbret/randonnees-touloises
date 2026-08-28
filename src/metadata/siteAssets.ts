/**
 * Media that components find by filename rather than through a relation: the
 * header logo, the favicon, and the placeholder posts fall back to. Nothing in
 * the CMS points at them, hence the lookup by name.
 *
 * Fetch these specifically. A bare `find()` returns Payload's default first ten
 * documents, which quietly stopped including the logo the moment a couple of
 * hundred member portraits landed in the same collection.
 */
export const SITE_ASSET_FILENAMES = ['logo.webp', 'favicon', 'post_placeholder']
