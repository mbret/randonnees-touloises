import type { Metadata } from 'next'

import { SEO_NOINDEX } from '@/seo/constants'
import { servedAt } from '@/seo/servedAt'
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
  ...servedAt('/logout'),
  robots: SEO_NOINDEX,
  title: 'Déconnexion',
}
