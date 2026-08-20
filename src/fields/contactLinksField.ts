import { Field } from 'payload'

export const contactLinksField: Field = {
  name: 'contactLinks',
  type: 'array',
  label: 'Moyens de contact',
  labels: {
    singular: 'Moyen de contact',
    plural: 'Moyens de contact',
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      options: [
        { label: 'E-mail', value: 'email' },
        { label: 'Téléphone', value: 'phone' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'Skype', value: 'skype' },
        { label: 'Autre', value: 'custom' },
      ],
      defaultValue: 'phone',
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
      name: 'value',
      type: 'text',
      label: 'Valeur',
    },
  ],
}
