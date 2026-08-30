'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User } from '@/payload-types'
import { useAuth } from '@/providers/auth'
import { useRouter } from 'next/navigation'
import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
// import { toast } from 'sonner'
import { getClientSideURL } from '@/utilities/getURL'
import { FormItem } from '@/components/common/FormItem'
import { FormError } from '@/components/common/FormError'
import { Message } from '@/components/common/Message'

type FormData = {
  email: string
  name: User['name']
  password: string
  passwordConfirm: string
}

export const AccountForm: React.FC = () => {
  const { setUser, user } = useAuth()
  const [changePassword, setChangePassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    formState: { errors, isLoading, isSubmitting, isDirty },
    handleSubmit,
    register,
    getValues,
    reset,
  } = useForm<FormData>()

  const router = useRouter()

  const onSubmit = useCallback(
    async (data: FormData) => {
      if (!user) return

      setError(null)
      setSuccess(null)

      /**
       * Only the half of the form on screen is sent. React Hook Form keeps the
       * values of fields it is not currently rendering, so the whole `FormData`
       * carries `password: ''` and `passwordConfirm` while the details are
       * showing. Payload does tolerate both today — an empty password is
       * ignored rather than set, and `passwordConfirm` is not a field on the
       * collection at all — but that is its leniency, not our intent, and
       * "change the details" should not be a request that mentions the
       * password.
       */
      const body = changePassword
        ? { password: data.password }
        : { email: data.email, name: data.name }

      /**
       * Every way this can fail lands in one place. A refusal answers with a
       * status, but a connection that never arrives — offline, dropped mid
       * flight — rejects instead, and so does a body that will not parse, and
       * neither of those reaches a check on `response.ok`. Leaving them
       * uncaught would put the save back to failing in silence, which is the
       * thing this form was doing in the first place.
       */
      let doc: User

      try {
        const response = await fetch(`${getClientSideURL()}/api/users/${user.id}`, {
          // Make sure to include cookies with fetch
          body: JSON.stringify(body),
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PATCH',
        })

        if (!response.ok) throw new Error(`The server answered ${response.status}.`)

        doc = (await response.json()).doc
      } catch {
        setError('There was a problem updating your account.')

        return
      }

      setUser(doc)
      setSuccess(changePassword ? 'Password updated.' : 'Account updated.')
      setChangePassword(false)
      reset({
        name: doc.name,
        email: doc.email,
        password: '',
        passwordConfirm: '',
      })
    },
    [changePassword, reset, setUser, user],
  )

  useEffect(() => {
    if (user === null) {
      router.push(
        `/login?error=${encodeURIComponent(
          'You must be logged in to view this page.',
        )}&redirect=${encodeURIComponent('/account')}`,
      )
    }

    // Once user is loaded, reset form to have default values
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        password: '',
        passwordConfirm: '',
      })
    }
  }, [user, router, reset, changePassword])

  return (
    <form className="max-w-xl" onSubmit={handleSubmit(onSubmit)}>
      <Message error={error} success={success} />

      {!changePassword ? (
        <Fragment>
          <div className="prose dark:prose-invert mb-8">
            <p className="">
              {'Change your account details below, or '}
              <Button
                className="px-0 text-inherit underline hover:cursor-pointer"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                click here
              </Button>
              {' to change your password.'}
            </p>
          </div>

          <div className="flex flex-col gap-8 mb-8">
            <FormItem>
              <Label htmlFor="email" className="mb-2">
                Email Address
              </Label>
              <Input
                id="email"
                {...register('email', { required: 'Please provide an email.' })}
                type="email"
              />
              {errors.email && <FormError message={errors.email.message} />}
            </FormItem>

            <FormItem>
              <Label htmlFor="name" className="mb-2">
                Name
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'Please provide a name.' })}
                type="text"
              />
              {errors.name && <FormError message={errors.name.message} />}
            </FormItem>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <div className="prose dark:prose-invert mb-8">
            <p>
              {'Change your password below, or '}
              <Button
                className="px-0 text-inherit underline hover:cursor-pointer"
                onClick={() => setChangePassword(!changePassword)}
                type="button"
                variant="link"
              >
                cancel
              </Button>
              .
            </p>
          </div>

          <div className="flex flex-col gap-8 mb-8">
            <FormItem>
              <Label htmlFor="password" className="mb-2">
                New password
              </Label>
              <Input
                id="password"
                {...register('password', { required: 'Please provide a new password.' })}
                type="password"
              />
              {errors.password && <FormError message={errors.password.message} />}
            </FormItem>

            <FormItem>
              <Label htmlFor="passwordConfirm" className="mb-2">
                Confirm password
              </Label>
              <Input
                id="passwordConfirm"
                {...register('passwordConfirm', {
                  required: 'Please confirm your new password.',
                  validate: (value) =>
                    value === getValues('password') || 'The passwords do not match',
                })}
                type="password"
              />
              {errors.passwordConfirm && <FormError message={errors.passwordConfirm.message} />}
            </FormItem>
          </div>
        </Fragment>
      )}
      <Button
        disabled={isLoading || isSubmitting || !isDirty || !user}
        type="submit"
        variant="default"
      >
        {isLoading || isSubmitting
          ? 'Processing'
          : changePassword
            ? 'Change Password'
            : 'Update Account'}
      </Button>
    </form>
  )
}
