import { SelectField } from 'payload'
import { roleField } from './role'

export const visibilityField: SelectField = {
  name: 'visibility',
  label: 'Visibilité',
  type: 'select',
  hasMany: true,
  options: roleField.options,
}
