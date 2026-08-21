import type { TextFieldSingleValidation } from 'payload'
import {
  BoldFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  lexicalEditor,
  UnderlineFeature,
  UnorderedListFeature,
  type LinkFields,
} from '@payloadcms/richtext-lexical'

export const defaultLexical = lexicalEditor({
  features: [
    ParagraphFeature(),
    UnderlineFeature(),
    BoldFeature(),
    ItalicFeature(),
    // A field that cannot parse a list is a field that throws on one. The
    // frontend converters already render list nodes, so content holding them
    // renders on the site while breaking the editor that is meant to fix it —
    // registering the nodes here is what keeps those two in step.
    UnorderedListFeature(),
    OrderedListFeature(),
    LinkFeature({
      // Media is here so an editor links a PDF by picking it rather than by
      // copying its URL out of the admin, where the address of the file and the
      // address of the page that edits it look equally copyable.
      enabledCollections: ['pages', 'posts', 'media'],
      fields: ({ defaultFields }) => {
        const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
          if ('name' in field && field.name === 'url') return false
          return true
        })

        return [
          ...defaultFieldsWithoutUrl,
          {
            name: 'url',
            type: 'text',
            admin: {
              condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
            },
            label: ({ t }) => t('fields:enterURL'),
            required: true,
            validate: ((value, options) => {
              if ((options?.siblingData as LinkFields)?.linkType === 'internal') {
                return true // no validation needed, as no url should exist for internal links
              }
              return value ? true : 'URL is required'
            }) as TextFieldSingleValidation,
          },
        ]
      },
    }),
  ],
})
