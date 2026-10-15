'use server'

import configPromise from '@payload-config'
import { after } from 'next/server'
import { getPayload, type Payload } from 'payload'

import { DEFAULT_SENDER } from '@/cms/globals/contactForm/config'
import { emailPattern } from '@/components/form/messages'
import type { ContactSubmission as StoredSubmission } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

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
 * Messages emailed per hour at most. The action is public and unthrottled, so
 * a bot could otherwise flood the recipient's mailbox and spend the SES
 * quota. Past the cap, messages are still stored, just not emailed.
 */
const HOURLY_EMAIL_CAP = 50

/** A display name in quotes, so a comma or bracket in it stays part of the name. */
const quoted = (name: string) => `"${name.replace(/[\\"]/g, '\\$&')}"`

/**
 * Emails a stored message to the address set in « Formulaire de contact ».
 * Replying to it writes to the visitor. Never throws: the message is already
 * saved, and the admin is where it is kept either way.
 */
async function notifyRecipient(payload: Payload, submission: StoredSubmission) {
  try {
    const settings = await payload.findGlobal({ slug: 'contactForm' })
    if (!settings.recipient) return

    // Counts this message too, which is already stored.
    const { totalDocs: lastHour } = await payload.count({
      collection: 'contactSubmissions',
      where: { createdAt: { greater_than: new Date(Date.now() - 3_600_000).toISOString() } },
    })
    if (lastHour > HOURLY_EMAIL_CAP) {
      payload.logger.warn(`[submitContact] ${lastHour} messages in the last hour, not emailing`)
      return
    }

    // One line, since it goes into the From and Subject headers.
    const nom = submission.nom.replace(/\s+/g, ' ')

    await payload.sendEmail({
      from: `${quoted(`${nom} via le site`)} <${settings.sender || DEFAULT_SENDER}>`,
      replyTo: submission.email,
      subject: `Nouveau message de ${nom}`,
      text: [
        `${nom} a écrit depuis la page Contact du site.`,
        '',
        `E-mail : ${submission.email}`,
        `Téléphone : ${submission.telephone || 'non renseigné'}`,
        '',
        submission.message || '(pas de message)',
        '',
        '—',
        'Répondez à cet e-mail pour écrire directement à cette personne.',
        `Le message dans l’administration : ${getServerSideURL()}/admin/collections/contactSubmissions/${submission.id}`,
      ].join('\n'),
      to: settings.recipient,
    })
  } catch (err) {
    payload.logger.error({ err, msg: '[submitContact] failed to email contact message' })
  }
}

/**
 * Stores a contact message so it shows up in the admin, then emails it once
 * the visitor has their answer — the SMTP exchange with SES is a few round
 * trips across the Atlantic they need not wait on.
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

    const submission = await payload.create({
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

    after(() => notifyRecipient(payload, submission))

    return { success: true }
  } catch (err) {
    console.error('[submitContact] failed to store contact message', err)

    return { error: 'server', success: false }
  }
}
