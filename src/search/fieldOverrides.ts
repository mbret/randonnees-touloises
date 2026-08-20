import { Field } from 'payload'

export const searchFields: Field[] = [
  {
    name: 'slug',
    type: 'text',
    label: 'Identifiant d’URL',
    index: true,
    admin: {
      readOnly: true,
    },
  },
  {
    // A result links to /programs or /news depending on this, so the index has
    // to carry it or every programme entry would be linked through a redirect.
    name: 'schedule',
    label: 'Au programme',
    type: 'group',
    admin: {
      readOnly: true,
    },
    fields: [
      {
        name: 'startDate',
        type: 'date',
        label: 'Date',
      },
    ],
  },
  {
    name: 'meta',
    label: 'Métadonnées',
    type: 'group',
    index: true,
    admin: {
      readOnly: true,
    },
    fields: [
      {
        type: 'text',
        name: 'title',
        label: 'Titre',
      },
      {
        type: 'text',
        name: 'description',
        label: 'Description',
      },
      {
        name: 'image',
        label: 'Image',
        type: 'upload',
        relationTo: 'media',
      },
    ],
  },
]
