import type { TextField as TextFieldConfig } from '@payloadcms/plugin-form-builder/types'
import type { FieldError, FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { TextareaField } from '@/components/form/fields'
import React from 'react'

import { Width } from '../Width'

export const Textarea: React.FC<
  TextFieldConfig & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
    rows?: number
  }
> = ({ name, defaultValue, errors, label, register, required, rows, width }) => (
  <Width width={width}>
    <TextareaField
      defaultValue={defaultValue}
      error={errors[name] as FieldError | undefined}
      label={label ?? name}
      name={name}
      register={register}
      required={required}
      rows={rows}
    />
  </Width>
)
