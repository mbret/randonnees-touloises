'use client'

import { SelectField, TextField, TextareaField } from '@/components/form/fields'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup } from '@/components/ui/field'
import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

export type ContactFormData = {
  nom: string
  email: string
  telephone?: string
  message?: string
}

/**
 * TODO: the submission backend is not wired up yet.
 * Replace with a server action that persists the submission and/or sends
 * the notification email.
 */
const submitContact = async (data: ContactFormData): Promise<void> => {
  console.warn('[ContactForm] submission backend not wired up yet', data)
  throw new Error('Contact form submission is not wired up yet')
}

export const ContactForm: React.FC = () => {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ContactFormData>()

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const onSubmit = useCallback(async (data: ContactFormData) => {
    setError(undefined)
    setIsLoading(true)

    try {
      await submitContact(data)
      setHasSubmitted(true)
    } catch (err) {
      console.error(err)
      setError('Une erreur est survenue, merci de réessayer plus tard.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  if (hasSubmitted) {
    return (
      <div className="prose dark:prose-invert">
        <h2>Merci !</h2>
        <p>Votre message a bien été envoyé. Nous vous répondrons dans les meilleurs délais.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <TextField error={errors.nom} label="Nom" name="nom" register={register} required />

        <TextField
          error={errors.email}
          label="Email"
          name="email"
          register={register}
          required
          type="email"
        />

        <TextField
          error={errors.telephone}
          label="Numéro de téléphone"
          name="telephone"
          register={register}
          type="tel"
        />

        <TextareaField error={errors.message} label="Message" name="message" register={register} />

        {error && <FieldError>{error}</FieldError>}

        <Button className="self-start" disabled={isLoading} type="submit">
          {isLoading ? 'Envoi en cours…' : 'Envoyer'}
        </Button>
      </FieldGroup>
    </form>
  )
}
