'use client'

import { FormError } from '@/components/common/FormError'
import { FormItem } from '@/components/common/FormItem'
import { Message } from '@/components/common/Message'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/providers/auth'
import { getServerSideURL } from '@/utilities/getURL'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  email: string
  password: string
  passwordConfirm: string
}

export const CreateAccountForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const { login } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<null | string>(null)

  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      const response = await fetch(`${getServerSideURL()}/api/users`, {
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const message = response.statusText || 'La création du compte a échoué.'
        setError(message)
        return
      }

      const redirect = searchParams.get('redirect')

      const timer = setTimeout(() => {
        setLoading(true)
      }, 1000)

      try {
        await login(data)
        clearTimeout(timer)
        if (redirect) router.push(redirect)
        else router.push(`/account?success=${encodeURIComponent('Votre compte a bien été créé.')}`)
      } catch (_) {
        clearTimeout(timer)
        setError('Les identifiants fournis sont incorrects. Veuillez réessayer.')
      }
    },
    [login, router, searchParams],
  )

  return (
    <form className="max-w-lg py-4" onSubmit={handleSubmit(onSubmit)}>
      <Message error={error} />

      <div className="flex flex-col gap-8 mb-8">
        <FormItem>
          <Label htmlFor="email" className="mb-2">
            Adresse e-mail
          </Label>
          <Input
            id="email"
            {...register('email', { required: 'L’adresse e-mail est obligatoire.' })}
            type="email"
          />
          {errors.email && <FormError message={errors.email.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="password" className="mb-2">
            Mot de passe
          </Label>
          <Input
            id="password"
            {...register('password', { required: 'Le mot de passe est obligatoire.' })}
            type="password"
          />
          {errors.password && <FormError message={errors.password.message} />}
        </FormItem>

        <FormItem>
          <Label htmlFor="passwordConfirm" className="mb-2">
            Confirmez le mot de passe
          </Label>
          <Input
            id="passwordConfirm"
            {...register('passwordConfirm', {
              required: 'Veuillez confirmer votre mot de passe.',
              validate: (value) =>
                value === getValues('password') || 'Les mots de passe ne correspondent pas.',
            })}
            type="password"
          />
          {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
        </FormItem>
      </div>
      <Button disabled={loading} type="submit" variant="default">
        {loading ? 'Création…' : 'Créer un compte'}
      </Button>

      <div className="prose dark:prose-invert mt-8">
        <p>
          {'Vous avez déjà un compte ? '}
          <Link href={`/login${allParams}`}>Connectez-vous</Link>
        </p>
      </div>
    </form>
  )
}
