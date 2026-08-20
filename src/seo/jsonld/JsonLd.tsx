import React from 'react'

import type { JsonLdNode } from './serialize'

import { serializeJsonLd } from './serialize'

/**
 * A JSON-LD block, as a plain `<script>` rather than through `next/script`:
 * that component is built for executable code, and this is data a crawler has
 * to find in the markup it is served.
 */
export const JsonLd = ({ data }: { data: JsonLdNode }) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
)
