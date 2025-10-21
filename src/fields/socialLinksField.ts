import { Field } from 'payload'

export const socialLinksField: Field = {
  name: 'socialLinks',
  type: 'array',
  fields: [
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Facebook', value: 'facebook' },
        { label: 'Twitter/X', value: 'twitter' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'GitHub', value: 'github' },
        { label: 'YouTube', value: 'youtube' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'facebook',
    },
    {
      name: 'customName',
      type: 'text',
      label: 'Custom Name',
      admin: {
        condition: (_, siblingData) => {
          return siblingData?.type === 'custom'
        },
      },
    },
    {
      name: 'uri',
      type: 'text',
    },
  ],
}
