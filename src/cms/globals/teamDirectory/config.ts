import { contactLinksField } from '@/fields/contactLinksField'
import { socialLinksField } from '@/fields/socialLinksField'
import type { GlobalConfig } from 'payload'

export const TeamDirectoryConfig: GlobalConfig = {
  slug: 'teamDirectory',
  label: 'Annuaire de l’équipe',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'teamMembers',
      type: 'array',
      label: 'Membres de l’équipe',
      labels: {
        singular: 'Membre',
        plural: 'Membres',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Nom',
        },
        {
          name: 'role',
          type: 'text',
          label: 'Fonction',
        },
        {
          name: 'description',
          type: 'text',
          label: 'Description',
        },
        {
          name: 'image',
          type: 'upload',
          label: 'Photo',
          relationTo: 'media',
        },
        contactLinksField,
        socialLinksField,
      ],
    },
  ],
}
