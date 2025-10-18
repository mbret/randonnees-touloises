import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { SelectField } from 'payload'
import { roleField } from './role'

export const visibilityField: SelectField = {
  name: 'visibility',
  type: 'select',
  hasMany: true,
  options: roleField.options,
}
