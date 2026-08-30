'use client'

import { TextField, TextareaField } from '@/components/form/fields'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup } from '@/components/ui/field'
import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

import { submitContact } from './actions'

export type ContactFormData = {
  nom: string
  email: string
  telephone?: string
  message?: string
}

export const ContactForm: React.FC = () => {
  const {
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
      const result = await submitContact(data)

      if (result.success) {
        setHasSubmitted(true)
      } else {
        setError(
          result.error === 'invalid'
            ? 'Merci de vérifier les informations saisies.'
            : 'Une erreur est survenue, merci de réessayer plus tard.',
        )
      }
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
