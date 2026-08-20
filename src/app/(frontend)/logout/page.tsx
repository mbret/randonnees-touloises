import type { Metadata } from 'next'

import { SEO_NOINDEX } from '@/seo/constants'
import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import React from 'react'

import { LogoutPage } from './LogoutPage'

export default async function Logout() {
  return (
    <div className="container my-16">
      {/* Same card width as the other auth screens. */}
      <div className="max-w-xl mx-auto">
        <LogoutPage />
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Vous êtes déconnecté de votre espace adhérent des Randonnées Touloises.',
  openGraph: mergeOpenGraph({
    title: 'Déconnexion',
    url: '/logout',
  }),
  robots: SEO_NOINDEX,
  title: 'Déconnexion',
}
