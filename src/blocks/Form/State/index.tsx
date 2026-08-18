import type { StateField } from '@payloadcms/plugin-form-builder/types'
import type { Control, FieldError, FieldErrorsImpl, FieldValues } from 'react-hook-form'

import { SelectField } from '@/components/form/fields'
import React from 'react'

import { Width } from '../Width'
import { stateOptions } from './options'

export const State: React.FC<
  StateField & {
    control: Control<FieldValues>
    errors: Partial<FieldErrorsImpl>
  }
> = ({ name, control, errors, label, required, width }) => (
  <Width width={width}>
    <SelectField
      control={control}
      error={errors[name] as FieldError | undefined}
      label={label ?? name}
      name={name}
      options={stateOptions}
      required={required}
    />
  </Width>
)
