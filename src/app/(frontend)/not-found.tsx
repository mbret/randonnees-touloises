import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>404</h1>
        <p className="mb-4">Cette page n'a pas été trouvée.</p>
      </div>
      <Button asChild variant="default">
        <Link href="/">Retour à l'accueil</Link>
      </Button>
    </div>
  )
}
