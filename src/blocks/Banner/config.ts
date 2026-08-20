import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Banner: Block = {
  slug: 'banner',
  labels: {
    singular: 'Encadré',
    plural: 'Encadrés',
  },
  fields: [
    {
      name: 'style',
      type: 'select',
      label: 'Style',
      defaultValue: 'info',
      options: [
        { label: 'Information', value: 'info' },
        { label: 'Avertissement', value: 'warning' },
        { label: 'Erreur', value: 'error' },
        { label: 'Réussite', value: 'success' },
      ],
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      label: false,
      required: true,
    },
  ],
  interfaceName: 'BannerBlock',
}
