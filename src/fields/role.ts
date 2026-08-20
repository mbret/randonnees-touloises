import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { ensureFirstUserIsAdmin } from '@/collections/Users/hooks/ensureFirstUserIsAdmin'
import { SelectField } from 'payload'

export const roleField: SelectField = {
  name: 'roles',
  type: 'select',
  label: 'Rôles',
  access: {
    create: adminOnlyFieldAccess,
    read: adminOnlyFieldAccess,
    update: adminOnlyFieldAccess,
  },
  defaultValue: ['customer'],
  hasMany: true,
  hooks: {
    beforeChange: [ensureFirstUserIsAdmin],
  },
  options: [
    {
      label: 'Administrateur',
      value: 'admin',
    },
    {
      label: 'Adhérent',
      value: 'customer',
    },
  ],
}
