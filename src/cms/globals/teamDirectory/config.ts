import { contactLinksField } from '@/fields/contactLinksField'
import { socialLinksField } from '@/fields/socialLinksField'
import type { GlobalConfig } from 'payload'

export const TeamDirectoryConfig: GlobalConfig = {
  slug: 'teamDirectory',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'teamMembers',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'role',
          type: 'text',
        },
        {
          name: 'description',
          type: 'text',
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
        contactLinksField,
        socialLinksField,
      ],
    },
  ],
}
