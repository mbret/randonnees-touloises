'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { General } from '@/payload-types'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'

const formSchema = z.object({
  password: z.string(),
})

export const ContentProtectedPasswordForm = ({ general }: { general: General }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    if (data.password === general.contentPassword) {
      document.cookie = `contentPassword=${encodeURIComponent(data.password)}; path=/; max-age=604800; SameSite=Lax`

      return window.location.reload()
    }

    form.setError('password', { message: 'Mot de passe incorrect' })
  }

  return (
    // TODO ghost card for mobile
    <Card className="w-full sm:max-w-md max-md:border-none max-md:shadow-none">
      <CardHeader>
        <CardTitle>Contenu protégé</CardTitle>
        <CardDescription>
          Veuillez entrer le mot de passe pour accéder au contenu protégé.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">Mot de passe</FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-title"
                    aria-invalid={fieldState.invalid}
                    placeholder="Entrez le mot de passe"
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Réinitialiser
          </Button>
          <Button type="submit" form="form-rhf-demo">
            Envoyer
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
