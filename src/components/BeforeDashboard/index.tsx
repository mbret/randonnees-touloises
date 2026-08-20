import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import './index.scss'

const baseClass = 'before-dashboard'

/**
 * Replaces the Payload template's welcome block, which was English and told the
 * reader to seed the database and clone the repository from Payload Cloud.
 * The committee that uses this admin is French, so the panel points at the
 * collections they actually edit instead.
 */
const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Bienvenue dans l’administration du site</h4>
      </Banner>
      Voici où trouver quoi :
      <ul className={`${baseClass}__instructions`}>
        <li>
          <strong>Publications</strong> — les actualités et les sorties. Une date dans « Au
          programme » place la publication au programme ; sans date, c’est une actualité.
        </li>
        <li>
          <strong>Événements</strong> — les entrées de l’agenda : randonnées hebdomadaires,
          assemblées générales. Une date, une heure, et c’est tout.
        </li>
        <li>
          <strong>Pages</strong> — les pages du site, composées de blocs que vous assemblez
          librement.
        </li>
        <li>
          <strong>Médias</strong> — les photos et les fichiers. Pensez à remplir le texte alternatif
          : il décrit l’image aux personnes qui ne la voient pas.
        </li>
        <li>
          <strong>Messages de contact</strong> — ce que les visiteurs envoient depuis la page
          Contact. Passez le statut à « Traité » quand c’est fait.
        </li>
      </ul>
      Pages, publications et événements fonctionnent par brouillons : un contenu enregistré comme{' '}
      <strong>Brouillon</strong> reste invisible pour les visiteurs, il faut{' '}
      <strong>Publier</strong> pour le mettre en ligne. <strong>Aperçu</strong> montre le brouillon
      avant sa publication.
    </div>
  )
}

export default BeforeDashboard
