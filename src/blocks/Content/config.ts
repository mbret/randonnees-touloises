import type { Block, Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

const columnFields: Field[] = [
  {
    name: 'size',
    type: 'select',
    label: 'Largeur',
    defaultValue: 'oneThird',
    options: [
      {
        label: 'Un tiers',
        value: 'oneThird',
      },
      {
        label: 'Moitié',
        value: 'half',
      },
      {
        label: 'Deux tiers',
        value: 'twoThirds',
      },
      {
        label: 'Pleine largeur',
        value: 'full',
      },
    ],
  },
  {
    name: 'richText',
    type: 'richText',
    editor: lexicalEditor({
      features: ({ rootFeatures }) => {
        return [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ]
      },
    }),
    label: false,
  },
  {
    name: 'enableLink',
    type: 'checkbox',
    label: 'Ajouter un lien',
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink)
        },
      },
    },
  }),
]

export const Content: Block = {
  slug: 'content',
  interfaceName: 'ContentBlock',
  labels: {
    singular: 'Contenu',
    plural: 'Contenus',
  },
  fields: [
    {
      name: 'columns',
      type: 'array',
      label: 'Colonnes',
      labels: {
        singular: 'Colonne',
        plural: 'Colonnes',
      },
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
}
