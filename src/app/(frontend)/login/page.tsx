import type { Metadata } from 'next'

import { SEO_NOINDEX } from '@/seo/constants'
import { servedAt } from '@/seo/servedAt'
import React from 'react'

import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import { RenderParams } from '@/components/common/RenderParams/RenderParams'
import { LoginForm } from '@/components/auth/LoginForm'

/** Reads the session to bounce an already-logged-in visitor; see the account layout. */
export const instant = false

export default async function Login() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

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
