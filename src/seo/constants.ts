import type { Metadata } from 'next'

export const SEO_TITLE = 'Randonnées Touloises'
export const SEO_DESCRIPTION = 'Randonnées dans la région de Toul.'
export const SEO_IMAGE = '/og-image.jpg'
export const SEO_SITE_NAME = 'Association Randonnées Touloises'

/**
 * Account pages are thin, duplicative and personalised — worthless in search
 * results, so they ask to be neither indexed nor crawled onwards.
 */
export const SEO_NOINDEX: Metadata['robots'] = { index: false, follow: false }
