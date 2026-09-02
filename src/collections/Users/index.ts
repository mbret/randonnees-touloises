import type { CollectionConfig } from 'payload'

import { publicAccess } from '@/access/publicAccess'
import { adminOnly } from '@/access/adminOnly'
import { adminOrSelf } from '@/access/adminOrSelf'
import { checkRole } from '@/access/utilities'
import { roleField } from '@/fields/role'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Utilisateur',
    plural: 'Utilisateurs',
  },
  access: {
    admin: ({ req: { user } }) => checkRole(['admin'], user),
    create: publicAccess,
    delete: adminOnly,
    read: adminOrSelf,
    update: adminOrSelf,
  },
  admin: {
    group: 'Utilisateurs',
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nom',
    },
    roleField,
    /**
     * The adhérent this account belongs to, if the club has a row for them.
     *
     * A join rather than a stored column: `adherents.user` is the one place the
     * link lives, and it is unique there, so this resolves to at most one
     * document. Not creatable from here either — an adhérent is someone the
     * club has written down, which is the secretary's act and not a consequence
     * of somebody signing up.
     */
    {
      name: 'adherent',
      type: 'join',
      label: 'Fiche adhérent',
      collection: 'adherents',
      on: 'user',
      admin: {
        allowCreate: false,
        defaultColumns: ['fullName', 'status', 'licence'],
      },
    },
    {
      name: 'orders',
      type: 'join',
      label: 'Commandes',
      collection: 'orders',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items'],
      },
    },
    {
      name: 'cart',
      type: 'join',
      label: 'Panier',
      collection: 'carts',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id', 'createdAt', 'total', 'currency', 'items'],
      },
    },
    {
      name: 'addresses',
      type: 'join',
      label: 'Adresses',
      collection: 'addresses',
      on: 'customer',
      admin: {
        allowCreate: false,
        defaultColumns: ['id'],
      },
    },
  ],
  timestamps: true,
}
