import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const FormBlock: Block = {
  slug: 'formBlock',
  admin: {
    images: {
      thumbnail: {
        alt: 'Un formulaire à remplir, avec son bouton d’envoi.',
        url: '/blocks/form.svg',
      },
    },
  },
  interfaceName: 'FormBlock',
  fields: [
    {
      name: 'form',
      type: 'relationship',
      label: 'Formulaire',
      relationTo: 'forms',
      required: true,
    },
    {
      name: 'enableIntro',
      type: 'checkbox',
      label: 'Ajouter un texte d’introduction',
    },
    {
      name: 'introContent',
      type: 'richText',
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
      label: 'Texte d’introduction',
    },
  ],
  graphQL: {
    singularName: 'FormBlock',
  },
  labels: {
    plural: 'Formulaires',
    singular: 'Formulaire',
  },
}
