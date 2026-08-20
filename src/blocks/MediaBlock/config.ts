import type { Block } from 'payload'

export const MediaBlock: Block = {
  slug: 'mediaBlock',
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
