import type { Block } from 'payload'

import { mediaPlatformOptions } from './platforms'

/**
 * A grid of links out to where the club's photos and videos actually live.
 *
 * Nothing is hosted here on purpose: the committee posts to a Google Photos
 * album or to the association's YouTube channel from a phone, and the site
 * points at it. An editor adding next month's outing writes one row — no
 * upload, no deploy — which is what the old site's ever-growing list of albums
 * would otherwise have cost.
 */
export const MediaLinks: Block = {
  slug: 'mediaLinks',
  admin: {
    images: {
      thumbnail: {
        alt: 'Une grille de cartes, chacune renvoyant vers un album ou une vidéo.',
        url: '/blocks/media-links.svg',
      },
    },
  },
  interfaceName: 'MediaLinksBlock',
  labels: {
    singular: 'Liens médias',
    plural: 'Liens médias',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Liens',
      labels: {
        singular: 'Lien',
        plural: 'Liens',
      },
      minRows: 1,
      required: true,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/blocks/MediaLinks/RowLabel#RowLabel',
        },
      },
      fields: [
        {
          name: 'platform',
          type: 'select',
          label: 'Plateforme',
          defaultValue: 'googlePhotos',
          options: mediaPlatformOptions,
          required: true,
          admin: {
            description:
              'Décide l’icône de la carte et le libellé du bouton — « Voir l’album » pour des photos, « Voir sur YouTube » pour une vidéo.',
          },
        },
        {
          name: 'title',
          type: 'text',
          label: 'Titre',
          required: true,
          admin: {
            description: 'Par exemple « Marche gourmande » ou « Randonnée Santé 2026 ».',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          admin: {
            description: 'Facultative. Une phrase disant ce que l’on trouve derrière le lien.',
          },
        },
        {
          name: 'date',
          type: 'date',
          label: 'Date',
          admin: {
            date: {
              pickerAppearance: 'dayOnly',
            },
            description:
              'Facultative, affichée sur la carte. Celle de la sortie, pas celle de la mise en ' +
              'ligne. Elle ne classe rien : l’ordre des cartes est celui des lignes, que l’on ' +
              'réarrange en les faisant glisser.',
          },
        },
        {
          name: 'url',
          type: 'text',
          label: 'Lien',
          required: true,
          admin: {
            description:
              'L’adresse de partage : « Partager » puis « Créer un lien » dans Google Photos, ou l’adresse de la vidéo ou de la chaîne YouTube.',
          },
          /* An address the browser can follow on its own. A card is a link and
           * nothing else, so a value that is not one — a bare `photos.app.goo.gl`
           * pasted without its scheme, which a browser reads as a path — renders
           * a card that quietly goes nowhere. Caught at the point it is typed
           * rather than found by a visitor. */
          validate: (value: string | null | undefined) => {
            if (!value) return 'Un lien est nécessaire.'

            let url: URL

            try {
              url = new URL(value)
            } catch {
              return 'Adresse incomplète : collez le lien entier, en commençant par https://'
            }

            if (url.protocol !== 'https:' && url.protocol !== 'http:') {
              return 'Le lien doit commencer par https://'
            }

            return true
          },
        },
        {
          name: 'cover',
          type: 'upload',
          label: 'Vignette',
          relationTo: 'media',
          /* Images only. The media collection accepts any file, and a document
           * or a sound has no width or height to give `next/image` — picking one
           * would take the page down at render rather than look wrong. */
          filterOptions: { mimeType: { contains: 'image' } },
          admin: {
            description:
              'Facultative : sans elle, la carte reprend d’elle-même l’image de l’album ou de ' +
              'la vidéo. N’en envoyez une que pour remplacer celle-là — elle a la priorité.',
          },
        },
      ],
    },
  ],
}
