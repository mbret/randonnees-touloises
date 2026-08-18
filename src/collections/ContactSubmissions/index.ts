import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

/**
 * Messages sent through the contact page.
 *
 * Nothing may be created over the REST API: the contact page posts through a
 * server action that writes with the Local API, so there is no public write
 * endpoint. The submitted fields are read-only in the admin — only `status`
 * is meant to be edited, to track what has been dealt with.
 */
export const ContactSubmissions: CollectionConfig = {
  slug: 'contactSubmissions',
  access: {
    create: () => false,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['nom', 'email', 'status', 'createdAt'],
    useAsTitle: 'nom',
  },
  labels: {
    plural: 'Messages de contact',
    singular: 'Message de contact',
  },
  fields: [
    {
      name: 'status',
      type: 'select',
      defaultValue: 'nouveau',
      options: [
        { label: 'Nouveau', value: 'nouveau' },
        { label: 'Traité', value: 'traite' },
      ],
      required: true,
    },
    {
      name: 'nom',
      type: 'text',
      admin: { readOnly: true },
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      admin: { readOnly: true },
      required: true,
    },
    {
      name: 'telephone',
      type: 'text',
      admin: { readOnly: true },
      label: 'Numéro de téléphone',
    },
    {
      name: 'message',
      type: 'textarea',
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
}
