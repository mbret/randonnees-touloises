import type { Metadata } from 'next'

import { SEO_NOINDEX } from '@/seo/constants'
import { servedAt } from '@/seo/servedAt'
import React from 'react'

import { redirect } from 'next/navigation'
import { RenderParams } from '@/components/common/RenderParams/RenderParams'
import { LoginForm } from '@/components/auth/LoginForm'
import { getSignedInUser } from '@/utilities/getSignedInUser'

export default async function Login() {
  const user = await getSignedInUser()

  if (user) {
    redirect(`/account?warning=${encodeURIComponent('Vous êtes déjà connecté.')}`)
  }

  return (
    <div className="container">
      <div className="max-w-xl mx-auto my-12">
        <RenderParams />

        <h1 className="mb-4 text-[1.8rem]">Connexion</h1>
        <p className="mb-8">
          Connectez-vous à votre espace adhérent des Randonnées Touloises pour gérer vos
          informations personnelles.
        </p>
        <LoginForm />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Connectez-vous à votre espace adhérent des Randonnées Touloises.',
  ...servedAt('/login'),
  robots: SEO_NOINDEX,
  title: 'Connexion',
}
