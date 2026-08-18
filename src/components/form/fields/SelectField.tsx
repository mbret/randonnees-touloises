'use client'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import React from 'react'
import { Controller } from 'react-hook-form'
import type { Control, FieldPath, FieldValues, PathValue } from 'react-hook-form'

import { validationMessages } from '../messages'
import { RequiredMark } from './RequiredMark'
import type { BaseFieldProps, SelectOption } from './types'

export type SelectFieldProps<TFieldValues extends FieldValues = FieldValues> =
  BaseFieldProps<TFieldValues> & {
    control: Control<TFieldValues>
    defaultValue?: string
    options: SelectOption[]
    placeholder?: string
  }

export const SelectField = <TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  defaultValue = '',
  error,
  label,
  options,
  placeholder,
  required,
}: SelectFieldProps<TFieldValues>) => (
  <Field data-invalid={Boolean(error)}>
    <FieldLabel className="gap-1" htmlFor={name}>
      {label}
      {required && <RequiredMark />}
    </FieldLabel>
    <Controller
      control={control}
      defaultValue={defaultValue as PathValue<TFieldValues, FieldPath<TFieldValues>>}
      name={name}
      render={({ field: { onChange, value } }) => (
        <Select onValueChange={onChange} value={options.find((o) => o.value === value)?.value}>
          <SelectTrigger aria-invalid={Boolean(error)} className="w-full" id={name}>
            <SelectValue placeholder={placeholder ?? label} />
          </SelectTrigger>
          <SelectContent>
            {options.map(({ label: optionLabel, value: optionValue }) => (
              <SelectItem key={optionValue} value={optionValue}>
                {optionLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      rules={{ required: required ? validationMessages.required : false }}
    />
    <FieldError errors={[error]} />
  </Field>
)
