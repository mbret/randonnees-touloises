import type { CollectionConfig } from 'payload'

export const GlobalPages: CollectionConfig = {
  slug: 'globalPages',
  labels: {
    singular: 'Page du site',
    plural: 'Pages du site',
  },
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nom',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Identifiant d’URL',
      required: true,
    },
  ],
}
