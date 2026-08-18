import type { CheckboxField as CheckboxFieldConfig } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldError, FieldErrorsImpl, FieldValues } from 'react-hook-form'

import { CheckboxField } from '@/components/form/fields'
import React from 'react'

import { Width } from '../Width'

export const Checkbox: React.FC<
  CheckboxFieldConfig & {
    control: Control<FieldValues>
    errors: Partial<FieldErrorsImpl>
  }
> = ({ name, control, defaultValue, errors, label, required, width }) => (
  <Width width={width}>
    <CheckboxField
      control={control}
      defaultValue={defaultValue}
      error={errors[name] as FieldError | undefined}
      label={label ?? name}
      name={name}
      required={required}
    />
  </Width>
)
