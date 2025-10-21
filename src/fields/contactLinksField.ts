import { Field } from 'payload'

export const contactLinksField: Field = {
  name: 'contactLinks',
  type: 'array',
  fields: [
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Email', value: 'email' },
        { label: 'Phone', value: 'phone' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'Skype', value: 'skype' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'phone',
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
      name: 'value',
      type: 'text',
    },
  ],
}
