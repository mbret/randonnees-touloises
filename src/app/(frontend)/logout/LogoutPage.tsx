'use client'

import { useAuth } from '@/providers/auth'
import Link from 'next/link'
import React, { Fragment, useEffect, useState } from 'react'

export const LogoutPage: React.FC = () => {
  const { logout } = useAuth()
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout()
        setSuccess('Vous êtes déconnecté.')
      } catch (_) {
        setError('Vous étiez déjà déconnecté.')
      }
    }

    void performLogout()
  }, [logout])

  return (
    <Fragment>
      {(error || success) && (
        <div className="prose dark:prose-invert">
          <h1>{error || success}</h1>
          <p>
            <Link href="/">Retourner à l’accueil</Link>
            {' ou '}
            <Link href="/login">vous reconnecter</Link>.
          </p>
        </div>
      )}
    </Fragment>
  )
}
