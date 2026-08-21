import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  admin: {
    images: {
      thumbnail: { alt: 'Une image ou une vidéo sur toute la largeur.', url: '/blocks/media.svg' },
    },
  },
  interfaceName: 'MediaBlock',
  labels: {
    singular: 'Média',
    plural: 'Médias',
  },
  fields: [
    {
      name: 'media',
      type: 'upload',
      label: 'Fichier',
      relationTo: 'media',
      required: true,
    },
  ],
}
