/**
 * Single source of validation copy for every form in the site, whether the
 * fields come from the CMS or are written by hand.
 */
export const validationMessages = {
  email: 'Merci de saisir une adresse email valide.',
  required: 'Ce champ est obligatoire.',
}

export const emailPattern = /^\S[^\s@]*@\S+$/
