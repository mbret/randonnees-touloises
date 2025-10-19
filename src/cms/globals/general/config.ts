import type { GlobalConfig } from 'payload'

export const General: GlobalConfig = {
  slug: 'general',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'contentPassword',
      type: 'text',
      label: 'Mot de passe pour le contenu',
      required: false,
    },
  ],
}
