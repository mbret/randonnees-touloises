'use server'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { emailPattern } from '@/components/form/messages'

export type ContactSubmission = {
  email: string
  message?: string
  nom: string
  telephone?: string
}

export type ContactSubmitResult = { success: true } | { error: string; success: false }

const LIMITS = { email: 320, message: 5000, nom: 200, telephone: 50 }

const clean = (value: string | undefined, max: number) => (value ?? '').trim().slice(0, max)

/**
 * Stores a contact message so it shows up in the admin.
 *
 * The collection denies `create` to everyone, so this writes with
 * `overrideAccess` — keeping the write path to this action alone rather than
 * exposing a public REST endpoint. The client already validates, but none of
 * that is trusted here.
 */
export async function submitContact(data: ContactSubmission): Promise<ContactSubmitResult> {
  const nom = clean(data?.nom, LIMITS.nom)
  const email = clean(data?.email, LIMITS.email)
  const telephone = clean(data?.telephone, LIMITS.telephone)
  const message = clean(data?.message, LIMITS.message)

  if (!nom || !email || !emailPattern.test(email)) {
    return { error: 'invalid', success: false }
  }

  try {
    const payload = await getPayload({ config: configPromise })

    await payload.create({
      collection: 'contactSubmissions',
      data: {
        email,
        message: message || undefined,
        nom,
        status: 'nouveau',
        telephone: telephone || undefined,
      },
      overrideAccess: true,
    })

    return { success: true }
  } catch (err) {
    console.error('[submitContact] failed to store contact message', err)

    return { error: 'server', success: false }
  }
}
