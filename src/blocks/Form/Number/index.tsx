import type { TextField as TextFieldConfig } from '@payloadcms/plugin-form-builder/types'
import type { FieldError, FieldErrorsImpl, FieldValues, UseFormRegister } from 'react-hook-form'

import { TextField } from '@/components/form/fields'
import React from 'react'

import { Width } from '../Width'

export const Number: React.FC<
  TextFieldConfig & {
    errors: Partial<FieldErrorsImpl>
    register: UseFormRegister<FieldValues>
  }
> = ({ name, defaultValue, errors, label, register, required, width }) => (
  <Width width={width}>
    <TextField
      defaultValue={defaultValue}
      error={errors[name] as FieldError | undefined}
      label={label ?? name}
      name={name}
      register={register}
      required={required}
      type="number"
    />
  </Width>
)
