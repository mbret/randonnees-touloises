import { Field } from 'payload'

export const socialLinksField: Field = {
  name: 'socialLinks',
  type: 'array',
  label: 'Réseaux sociaux',
  labels: {
    singular: 'Réseau social',
    plural: 'Réseaux sociaux',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      options: [
        { label: 'Facebook', value: 'facebook' },
        { label: 'Twitter/X', value: 'twitter' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'GitHub', value: 'github' },
        { label: 'YouTube', value: 'youtube' },
        { label: 'Autre', value: 'custom' },
      ],
      defaultValue: 'facebook',
    },
    {
      name: 'customName',
      type: 'text',
      label: 'Intitulé',
      admin: {
        condition: (_, siblingData) => {
          return siblingData?.type === 'custom'
        },
      },
    },
    {
      name: 'uri',
      type: 'text',
      label: 'Adresse',
    },
  ],
}
