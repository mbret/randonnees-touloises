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
