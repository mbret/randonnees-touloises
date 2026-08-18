'use client'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import React from 'react'
import type { FieldValues, UseFormRegister } from 'react-hook-form'

import { emailPattern, validationMessages } from '../messages'
import { RequiredMark } from './RequiredMark'
import type { BaseFieldProps } from './types'

export type TextFieldProps<TFieldValues extends FieldValues = FieldValues> =
  BaseFieldProps<TFieldValues> & {
    defaultValue?: string | number
    register: UseFormRegister<TFieldValues>
    type?: 'email' | 'number' | 'tel' | 'text'
  }

export const TextField = <TFieldValues extends FieldValues = FieldValues>({
  name,
  defaultValue,
  error,
  label,
  register,
  required,
  type = 'text',
}: TextFieldProps<TFieldValues>) => (
  <Field data-invalid={Boolean(error)}>
    <FieldLabel className="gap-1" htmlFor={name}>
      {label}
      {required && <RequiredMark />}
    </FieldLabel>
    <Input
      aria-invalid={Boolean(error)}
      defaultValue={defaultValue}
      id={name}
      type={type}
      {...register(name, {
        required: required ? validationMessages.required : false,
        ...(type === 'email'
          ? { pattern: { message: validationMessages.email, value: emailPattern } }
          : {}),
      })}
    />
    <FieldError errors={[error]} />
  </Field>
)
