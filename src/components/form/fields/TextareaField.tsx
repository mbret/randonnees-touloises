'use client'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import React from 'react'
import type { FieldValues, UseFormRegister } from 'react-hook-form'

import { validationMessages } from '../messages'
import { RequiredMark } from './RequiredMark'
import type { BaseFieldProps } from './types'

export type TextareaFieldProps<TFieldValues extends FieldValues = FieldValues> =
  BaseFieldProps<TFieldValues> & {
    defaultValue?: string
    register: UseFormRegister<TFieldValues>
    rows?: number
  }

export const TextareaField = <TFieldValues extends FieldValues = FieldValues>({
  name,
  defaultValue,
  error,
  label,
  register,
  required,
  rows = 6,
}: TextareaFieldProps<TFieldValues>) => (
  <Field data-invalid={Boolean(error)}>
    <FieldLabel className="gap-1" htmlFor={name}>
      {label}
      {required && <RequiredMark />}
    </FieldLabel>
    <Textarea
      aria-invalid={Boolean(error)}
      defaultValue={defaultValue}
      id={name}
      rows={rows}
      {...register(name, { required: required ? validationMessages.required : false })}
    />
    <FieldError errors={[error]} />
  </Field>
)
