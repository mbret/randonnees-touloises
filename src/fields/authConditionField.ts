import { SelectField } from 'payload'

export const authConditionField: SelectField = {
  name: 'authCondition',
  label: "Condition d'accès",
  type: 'select',
  options: [
    {
      label: 'Toujours',
      value: 'always',
    },
    {
      label: 'Connecté seulement',
      value: 'loggedIn',
    },
    {
      label: 'Déconnecté seulement',
      value: 'loggedOut',
    },
  ],
}
