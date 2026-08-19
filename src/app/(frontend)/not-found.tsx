import Link from 'next/link'
import React from 'react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <div className="container flex flex-col items-center text-center">
        <div className="prose dark:prose-invert">
          <h1 className="mb-2">404</h1>
          <p>Cette page n’a pas été trouvée.</p>
        </div>
        <Button asChild variant="default" className="mt-8">
          <Link href="/">Retour à l’accueil</Link>
        </Button>
      </div>
    </div>
  )
}
