import type { Field } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const hero: Field = {
  name: 'hero',
  type: 'group',
  fields: [
    {
      name: 'type',
      type: 'select',
      defaultValue: 'lowImpact',
      label: 'Type',
      options: [
        {
          label: 'Aucun',
          value: 'none',
        },
        {
          label: 'Grand format',
          value: 'highImpact',
        },
        {
          label: 'Format moyen',
          value: 'mediumImpact',
        },
        {
          label: 'Format réduit',
          value: 'lowImpact',
        },
      ],
      required: true,
    },
    {
      name: 'richText',
      type: 'richText',
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
      label: false,
    },
    /**
     * The sentence under the title, in lighter type.
     *
     * Its own field rather than the second paragraph of the rich text above,
     * which is where it used to live on the pages this replaced — as
     * `<p className="lead">`, written by hand in the JSX. Nothing in the editor
     * can mark one paragraph as the strapline, so inferring it from position was
     * the alternative: the paragraph after the `h1` gets the treatment whether
     * the editor meant it that way or not, and a page can then never open with
     * an ordinary paragraph. Saying it outright costs one column and removes the
     * guess.
     *
     * Plain text on purpose. A strapline is one sentence; there is nothing in it
     * to bold, link or turn into a list, and the rich text field above is there
     * for anything that needs to be.
     */
    {
      name: 'subtitle',
      type: 'textarea',
      label: 'Sous-titre',
      admin: {
        condition: (_, { type } = {}) => type !== 'none',
        description: 'Une phrase sous le titre, en plus clair. À laisser vide s’il n’y en a pas.',
      },
    },
    linkGroup({
      overrides: {
        maxRows: 2,
      },
    }),
    {
      name: 'media',
      type: 'upload',
      label: 'Image',
      admin: {
        condition: (_, { type } = {}) => ['highImpact', 'mediumImpact'].includes(type),
      },
      relationTo: 'media',
      required: true,
    },
  ],
  label: false,
}
