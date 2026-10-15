import type { EmailField, GlobalConfig } from 'payload'
import { email } from 'payload/shared'

import { adminOnly } from '@/access/adminOnly'

/**
 * The domain verified in Amazon SES. SES refuses to send from any other, so a
 * sender outside it would drop every notification without the admin noticing.
 */
const SENDING_DOMAIN = 'randonnees-touloises.net'

export const DEFAULT_SENDER = `contact@${SENDING_DOMAIN}`

const validateSender: EmailField['validate'] = (value, args) => {
  const valid = email(value, args)
  if (valid !== true) return valid

  return value?.toLowerCase().endsWith(`@${SENDING_DOMAIN}`)
    ? true
    : `L’adresse doit se terminer par @${SENDING_DOMAIN}.`
}

/**
 * Where the contact page's messages are emailed. Admins only: members log in
 * as users too, and these decide where visitors' messages go.
 */
export const ContactForm: GlobalConfig = {
  slug: 'contactForm',
  label: 'Formulaire de contact',
  access: {
    read: adminOnly,
    update: adminOnly,
  },
  fields: [
    {
      name: 'recipient',
      type: 'email',
      label: 'Envoyer les messages à',
      admin: {
        description:
          'Chaque message envoyé depuis la page Contact est transmis à cette adresse. ' +
          'Laissez vide pour ne rien envoyer : les messages restent consultables dans ' +
          '« Messages de contact ».',
      },
    },
    {
      name: 'sender',
      type: 'email',
      label: 'Adresse d’expédition',
      admin: {
        description:
          `L’adresse qui apparaît comme expéditeur, sur le domaine ${SENDING_DOMAIN}. ` +
          'Elle n’a pas besoin d’exister : répondre à l’e-mail écrit directement à la ' +
          'personne qui a envoyé le message.',
      },
      defaultValue: DEFAULT_SENDER,
      required: true,
      validate: validateSender,
    },
  ],
}
