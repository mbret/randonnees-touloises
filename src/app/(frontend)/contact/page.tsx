import type { Metadata } from 'next/types'

import { ContactForm } from '@/components/contacts/ContactForm'
import { servedAt } from '@/seo/servedAt'
import React from 'react'

export default function Page() {
  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-none mb-12">
          <h1>Contact</h1>
          <p>
            Remplissez le formulaire et cliquez sur le bouton <strong>ENVOYER</strong>.
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          <ContactForm />

          <div className="prose dark:prose-invert">
            <h2>Association Randonnées Touloises</h2>
            <address className="not-italic">
              Maison des Associations
              <br />
              2, cours Raymond Poincaré
              <br />
              54200 Toul
            </address>
          </div>
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Contactez l’association Randonnées Touloises.',
  ...servedAt('/contact'),
  title: 'Contact',
}
