import type { SelectField as SelectFieldConfig } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldError, FieldErrorsImpl, FieldValues } from 'react-hook-form'

import { SelectField } from '@/components/form/fields'
import React from 'react'

import { Width } from '../Width'

export const Select: React.FC<
  SelectFieldConfig & {
    control: Control<FieldValues>
    errors: Partial<FieldErrorsImpl>
  }
> = ({ name, control, defaultValue, errors, label, options, required, width }) => (
  <Width width={width}>
    <SelectField
      control={control}
      defaultValue={defaultValue}
      error={errors[name] as FieldError | undefined}
      label={label ?? name}
      name={name}
      options={options}
      required={required}
    />
  </Width>
)
