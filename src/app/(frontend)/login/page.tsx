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

/**
 * Allowed to block, deliberately. The whole point of this page is the answer to
 * "who is asking": it either redirects or it renders, and there is no useful
 * shell to show in the meantime. Streaming the check behind a boundary would mean
 * sending a login form to somebody already logged in first and bouncing the reader afterwards.
 */
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
