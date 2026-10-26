import type { Metadata } from 'next'

import { SEO_NOINDEX } from '@/seo/constants'
import { RenderParams } from '@/components/common/RenderParams/RenderParams'
import { servedAt } from '@/seo/servedAt'
import React from 'react'
import { redirect } from 'next/navigation'
import { CreateAccountForm } from '@/components/auth/CreateAccountForm'
import { getSignedInUser } from '@/utilities/getSignedInUser'

export default async function CreateAccount() {
  const user = await getSignedInUser()

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
