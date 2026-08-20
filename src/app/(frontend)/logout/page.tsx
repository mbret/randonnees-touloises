import type { Metadata } from 'next'

import { SEO_NOINDEX } from '@/seo/constants'
import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import React from 'react'

import { LogoutPage } from './LogoutPage'

export default async function Logout() {
  return (
    <div className="container mx-auto max-w-lg my-16">
      <LogoutPage />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Vous êtes déconnecté de votre espace adhérent des Randonnées Touloises.',
  openGraph: mergeOpenGraph({
    url: '/logout',
  }),
  robots: SEO_NOINDEX,
  title: 'Déconnexion',
}
