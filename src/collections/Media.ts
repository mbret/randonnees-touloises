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
import { revalidateMedia, revalidateMediaDelete } from '@/hooks/revalidateMedia'

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
  hooks: {
    afterChange: [revalidateMedia],
    afterDelete: [revalidateMediaDelete],
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
     * A day of freshness, then a month in which a cache answers from its copy
     * and refreshes behind the answer. Nothing blocks on revalidation, which is
     * what made the old behaviour expensive, and a replaced file still reaches
     * everyone within a day of being replaced.
     *
     * Not `immutable`, and finite: this hook sees only the response, so it
     * cannot tell a URL carrying the `updatedAt` cache tag `getMediaUrl` stamps
     * on it from a bare `/api/media/file/<filename>` — a URL anyone can
     * request, and that nothing can invalidate once it has been linked from
     * outside this codebase. A year of immutable on the second kind is
     * unfixable without purging a CDN, so this is the header the bare kind
     * needs.
     *
     * The tagged kind is answered by the route that wraps this one —
     * `src/app/(payload)/api/media/file/[filename]` — where the request is
     * visible and a tagged URL can be recognised and kept forever. What is set
     * here is therefore the floor, not the ceiling.
     *
     * `_next/image` reads this too: Next takes the optimised image's
     * `Cache-Control` from the upstream response (or `minimumCacheTTL`,
     * whichever is longer), so an uncacheable original made every optimised
     * variant uncacheable in the browser as well.
     */
    modifyResponseHeaders: ({ headers }) => {
      headers.set(
        'Cache-Control',
        'public, max-age=86400, s-maxage=86400, stale-while-revalidate=2592000',
      )

      return headers
    },
    focalPoint: true,
    /**
     * What a visitor is actually served, and the reason nothing is resized at
     * request time any more.
     *
     * These five widths were already being generated for every upload and
     * nothing read them: the site handed the full-size original to
     * `next/image`, which derived the same ladder again per width, per format
     * and per browser, at a price per derivation that renewed monthly. Sharp
     * does the work here instead — once, at upload, into storage that is
     * charged by the gigabyte rather than by the request.
     *
     * WebP because it is where the saving is: 240 of the club's 249 uploads are
     * JPEG or PNG, and converting them is worth more than any amount of
     * resizing. `ImageMedia` offers this ladder through a `<source>` typed
     * `image/webp`, so a browser too old to decode it falls through to the
     * original in the format it was uploaded in.
     *
     * `withoutEnlargement` is unset on every rung but the top one: left alone,
     * Payload omits a size wider than the original rather than upscaling into
     * it, so nothing on the ladder is ever an enlargement of what was uploaded
     * and the `srcset` offers only rungs that exist.
     *
     * Unset on the top rung too, that rule has a hole in it, and it is the one
     * that matters: it leaves the ladder stopping at the last rung below the
     * original rather than at the original. A 527px poster clears 300 and
     * misses 600, so the only WebP it had was the 300 — offered through a
     * `<source>` that wins over the `<img>` beneath it, so a full-bleed hero
     * 1318px wide was served 300px and the 527 sitting in the bucket was never
     * reached. See `xlarge` for the whole of the fix.
     */
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        formatOptions: { format: 'webp', options: { quality: 75 } },
      },
      /**
       * A centre crop rather than a scaled copy, so it cannot join the ladder
       * above — a `srcset` may only offer one shape. Nothing reads it today;
       * it is kept because dropping a size drops its columns, which wants a
       * migration of its own rather than a line in this one.
       */
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
        formatOptions: { format: 'webp', options: { quality: 75 } },
      },
      {
        name: 'medium',
        width: 900,
        formatOptions: { format: 'webp', options: { quality: 75 } },
      },
      {
        name: 'large',
        width: 1400,
        formatOptions: { format: 'webp', options: { quality: 75 } },
      },
      /**
       * The top of the ladder, and the only rung that is allowed to land
       * somewhere other than its own width.
       *
       * `withoutEnlargement: true` does not enlarge anything — sharp still
       * refuses to scale up, and Payload reads the flag a second time to stop
       * omitting the size. What comes back is the original at its own size
       * whenever that is under 1920, so the top rung is always
       * `min(original, 1920)` and the ladder always reaches the best pixels
       * there are. An upload over 1920 is resized to 1920 exactly as before.
       *
       * On the top rung alone because one is enough. Setting it on the rungs
       * below would have each of them return that same copy — four more
       * encodes and four more writes for a file the top rung already made,
       * under a name generated from the dimensions, so all of them land on it
       * anyway. It does mean this rung is sometimes 300px and still called
       * `xlarge`; nothing reads the ladder by name, only by width.
       */
      {
        name: 'xlarge',
        width: 1920,
        formatOptions: { format: 'webp', options: { quality: 75 } },
        withoutEnlargement: true,
      },
      /**
       * The social card, left in the format it was uploaded in on purpose:
       * this URL is read by scrapers rather than by browsers, and WebP support
       * across them is not something to discover after a post is shared.
       */
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
