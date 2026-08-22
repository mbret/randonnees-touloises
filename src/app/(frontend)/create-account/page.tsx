import type { Metadata } from 'next'

import { SEO_NOINDEX } from '@/seo/constants'
import { RenderParams } from '@/components/common/RenderParams/RenderParams'
import { servedAt } from '@/seo/servedAt'
import React from 'react'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { redirect } from 'next/navigation'
import { CreateAccountForm } from '@/components/auth/CreateAccountForm'

/**
 * Allowed to block, deliberately. The whole point of this page is the answer to
 * "who is asking": it either redirects or it renders, and there is no useful
 * shell to show in the meantime. Streaming the check behind a boundary would mean
 * sending a signup form to somebody already logged in first and bouncing the reader afterwards.
 */
export const instant = false

export default async function CreateAccount() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (user) {
    redirect(`/account?warning=${encodeURIComponent('Vous êtes déjà connecté.')}`)
  }

  return (
    <div className="container py-16">
      {/* Same card width as the other auth screens. */}
      <div className="max-w-xl mx-auto">
        <h1 className="text-xl mb-4">Créer un compte</h1>
        <RenderParams />
        <CreateAccountForm />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Créez votre compte pour accéder à votre espace adhérent des Randonnées Touloises.',
  ...servedAt('/create-account'),
  robots: SEO_NOINDEX,
  title: 'Créer un compte',
}
