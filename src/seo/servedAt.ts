import type { Metadata } from 'next'

import { mergeOpenGraph } from './mergeOpenGraph'

/**
 * The metadata a page derives from its own address.
 *
 * Two tags name that address — the canonical link and `og:url` — and a page
 * that writes them one at a time is a page where they can disagree. Taking the
 * path once and emitting both from it is what keeps them the same address.
 *
 * The canonical is what tells a crawler which of several addresses serving the
 * same content is the one to index: `/news` over `/news/page/1`, `/search` over
 * `/search?q=`. So the path handed in is the address the page wants to be
 * known by, which is not always the address it was reached at.
 *
 * A site-relative path is enough: `metadataBase` in the root layout resolves
 * both fields onto the live host, so the host stays named in one place. An
 * absolute URL is passed through untouched, which is what the CMS documents
 * hand in.
 */
export const servedAt = (
  path: string,
  openGraph?: Metadata['openGraph'],
): Pick<Metadata, 'alternates' | 'openGraph'> => ({
  alternates: { canonical: path },
  openGraph: mergeOpenGraph({ ...openGraph, url: path }),
})
