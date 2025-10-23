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
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
    {
      name: 'mediaSource',
      type: 'radio',
      required: true,
      defaultValue: 'upload',
      options: [
        {
          label: 'Upload Media',
          value: 'upload',
        },
        {
          label: 'External Media',
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
      relationTo: 'media',
      required: true,
      admin: {
        condition: (data) => data.mediaSource === 'upload',
      },
    },
    {
      name: 'externalMedia',
      type: 'group',
      admin: {
        condition: (data) => data.mediaSource === 'external',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
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
              label: 'External Image',
              value: 'image',
            },
            {
              label: 'Other',
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
          label: 'Alt Text',
        },
        {
          name: 'caption',
          type: 'richText',
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
