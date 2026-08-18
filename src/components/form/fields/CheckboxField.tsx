'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import React from 'react'
import { Controller } from 'react-hook-form'
import type { Control, FieldPath, FieldValues, PathValue } from 'react-hook-form'

import { validationMessages } from '../messages'
import { RequiredMark } from './RequiredMark'
import type { BaseFieldProps } from './types'

export type CheckboxFieldProps<TFieldValues extends FieldValues = FieldValues> =
  BaseFieldProps<TFieldValues> & {
    control: Control<TFieldValues>
    defaultValue?: boolean
  }

export const CheckboxField = <TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  defaultValue = false,
  error,
  label,
  required,
}: CheckboxFieldProps<TFieldValues>) => (
  <Field data-invalid={Boolean(error)}>
    <Field orientation="horizontal">
      <Controller
        control={control}
        defaultValue={defaultValue as PathValue<TFieldValues, FieldPath<TFieldValues>>}
        name={name}
        render={({ field: { onChange, value } }) => (
          <Checkbox
            aria-invalid={Boolean(error)}
            checked={Boolean(value)}
            id={name}
            onCheckedChange={onChange}
          />
        )}
        rules={{ required: required ? validationMessages.required : false }}
      />
      <FieldLabel className="gap-1 font-normal" htmlFor={name}>
        {label}
        {required && <RequiredMark />}
      </FieldLabel>
    </Field>
    <FieldError errors={[error]} />
  </Field>
)
