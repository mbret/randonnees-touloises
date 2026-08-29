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

const CONTENT_PASSWORD_MAX_AGE = 60 * 60 * 24 * 7

/**
 * Writing the cookie lives out here rather than in the submit handler because
 * `document` is not the component's to touch: the React Compiler reads an
 * assignment to it inside a component as mutating something defined outside,
 * which it cannot reason about. Out here it is what it always was — a browser
 * side effect, run from an event.
 */
const rememberContentPassword = (password: string) => {
  document.cookie = `contentPassword=${encodeURIComponent(password)}; path=/; max-age=${CONTENT_PASSWORD_MAX_AGE}; SameSite=Lax`
}

export const ContentProtectedPasswordForm = ({ general }: { general: General }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    // Compared here in the browser, which is what puts the password in the page.
    // Soft lock, known — see the note on `WithContentProtectedPassword`.
    if (data.password === general.contentPassword) {
      rememberContentPassword(data.password)

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
