import type { Block } from 'payload'

import { cardIconOptions } from './icons'

export const IconCards: Block = {
  slug: 'iconCards',
  interfaceName: 'IconCardsBlock',
  labels: {
    singular: 'Cartes avec icône',
    plural: 'Cartes avec icône',
  },
  fields: [
    {
      name: 'cards',
      type: 'array',
      label: 'Cartes',
      labels: {
        singular: 'Carte',
        plural: 'Cartes',
      },
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'icon',
          type: 'select',
          label: 'Icône',
          defaultValue: 'compass',
          options: cardIconOptions,
          required: true,
          admin: {
            components: {
              // Draws the chosen icon under the field: a name in a dropdown
              // says less than the picture it stands for.
              afterInput: ['@/blocks/IconCards/IconFieldPreview#IconFieldPreview'],
            },
          },
        },
        {
          name: 'title',
          type: 'text',
          label: 'Titre',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Description',
          required: true,
        },
      ],
    },
    {
      name: 'media',
      type: 'upload',
      label: 'Illustration',
      relationTo: 'media',
      /* Images only. The media collection accepts any file, and a document or a
       * sound has no width or height to give `next/image` — picking one would
       * take the page down at render rather than look wrong. */
      filterOptions: { mimeType: { contains: 'image' } },
      admin: {
        description:
          'Facultative. Placée à côté des cartes sur grand écran, au-dessus d’elles sur mobile.',
      },
    },
    {
      name: 'mediaPosition',
      type: 'select',
      label: 'Côté de l’illustration',
      defaultValue: 'right',
      options: [
        { label: 'À droite des cartes', value: 'right' },
        { label: 'À gauche des cartes', value: 'left' },
      ],
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.media),
      },
    },
  ],
}
