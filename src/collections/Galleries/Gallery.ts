import type { CollectionConfig } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { publicAccess } from '@/access/publicAccess'
import { authenticated } from '@/access/authenticated'

export const GalleriesConfig: CollectionConfig = {
  slug: 'gallery',
  labels: {
    singular: 'Élément de galerie',
    plural: 'Galerie',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: publicAccess,
    update: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nom',
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
    {
      name: 'mediaSource',
      type: 'radio',
      label: 'Source du média',
      required: true,
      defaultValue: 'upload',
      options: [
        {
          label: 'Fichier envoyé',
          value: 'upload',
        },
        {
          label: 'Média externe',
          value: 'external',
        },
      ],
      admin: {
        layout: 'horizontal',
      },
    },
    {
      name: 'media',
      type: 'upload',
      label: 'Fichier',
      relationTo: 'media',
      required: true,
      admin: {
        condition: (data) => data.mediaSource === 'upload',
      },
    },
    {
      name: 'externalMedia',
      type: 'group',
      label: 'Média externe',
      admin: {
        condition: (data) => data.mediaSource === 'external',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          label: 'Type',
          required: true,
          options: [
            {
              label: 'YouTube',
              value: 'youtube',
            },
            {
              label: 'Vimeo',
              value: 'vimeo',
            },
            {
              label: 'Image externe',
              value: 'image',
            },
            {
              label: 'Autre',
              value: 'other',
            },
          ],
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          label: 'URL',
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Texte alternatif',
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
    },
  ],
}
