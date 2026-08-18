import type { FieldError, FieldPath, FieldValues } from 'react-hook-form'

export type BaseFieldProps<TFieldValues extends FieldValues = FieldValues> = {
  error?: FieldError
  label: string
  name: FieldPath<TFieldValues>
  required?: boolean
}

export type SelectOption = {
  label: string
  value: string
}
