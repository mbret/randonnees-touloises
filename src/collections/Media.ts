import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { authenticated } from '../access/authenticated'
import { publicAccess } from '@/access/publicAccess'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Média',
    plural: 'Médias',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publicAccess,
    update: authenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texte alternatif',
      admin: {
        description:
          'Ce que l’image montre, pour les personnes qui ne la voient pas et pour les moteurs de recherche.',
      },
      //required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      label: 'Légende',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    /**
     * Every upload is served by `/api/media/file/<filename>`, a function that
     * streams the object out of the bucket. Neither Payload nor the S3 adapter
     * sets `Cache-Control` on that response, and a response without one gets
     * `public, max-age=0, must-revalidate` from the host — so nothing was
     * cached anywhere. Each image cost a function invocation and two round
     * trips to R2 on every page view, even for a browser that already held the
     * bytes: the header logo alone spent ~1.5s revalidating into a 304.
     *
     * The files are in fact immutable. `getMediaUrl` stamps each URL with the
     * document's `updatedAt`, so replacing a file changes the URL rather than
     * the bytes behind one, and nothing can be served stale. Anything that
     * renders a media URL without that cache tag opts out of the invalidation
     * and would hold a year-old copy — so keep the tag when adding one.
     *
     * `_next/image` depends on this too: Next takes the optimised image's
     * `Cache-Control` from the upstream response (or `minimumCacheTTL`,
     * whichever is longer), so an uncacheable original made every optimised
     * variant uncacheable in the browser as well.
     */
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable')

      return headers
    },
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
