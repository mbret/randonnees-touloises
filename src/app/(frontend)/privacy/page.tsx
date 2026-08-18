import type { Metadata } from 'next/types'

import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import React from 'react'

export default function Page() {
  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-3xl mx-auto">
          <h1>Politique de confidentialité</h1>
          <p className="lead">Association Randonnées Touloises</p>

          <h2 id="introduction">Introduction</h2>
          <p>
            La présente politique de confidentialité a pour objectif d’informer les utilisateurs du
            site de l’association RANDONNÉES TOULOISES sur la manière dont leurs données
            personnelles sont collectées et utilisées. Nous nous engageons à respecter la
            confidentialité des données personnelles conformément au Règlement Général sur la
            Protection des Données (RGPD).
          </p>

          <h2 id="responsable-du-traitement">Responsable du traitement</h2>
          <p>Le responsable du traitement des données est :</p>
          <address className="not-italic">
            RANDONNÉES TOULOISES
            <br />
            2, cours Raymond Poincaré
            <br />
            54200 TOUL
            <br />
            Email : <a href="mailto:randonneestouloises@gmail.com">randonneestouloises@gmail.com</a>
          </address>

          <h2 id="donnees-collectees">Données collectées</h2>
          <p>
            Lorsque vous utilisez le formulaire de contact du site, nous pouvons collecter les
            informations suivantes :
          </p>
          <ul>
            <li>nom (obligatoire) ;</li>
            <li>adresse email (obligatoire) ;</li>
            <li>téléphone (facultatif) ;</li>
            <li>contenu du message envoyé.</li>
          </ul>
          <p>
            Ces données sont uniquement fournies volontairement par l’utilisateur via le formulaire
            de contact.
          </p>

          <h2 id="finalite-de-la-collecte">Finalité de la collecte</h2>
          <p>Les données collectées servent uniquement à :</p>
          <ul>
            <li>répondre aux demandes envoyées via le formulaire de contact ;</li>
            <li>assurer le suivi des échanges avec les utilisateurs.</li>
          </ul>

          <h2 id="base-legale-du-traitement">Base légale du traitement</h2>
          <p>
            Le traitement des données repose sur le consentement de l’utilisateur lorsqu’il envoie
            un message via le formulaire de contact.
          </p>

          <h2 id="duree-de-conservation">Durée de conservation</h2>
          <p>
            Les données transmises via le formulaire de contact sont conservées pendant une durée
            maximale de 12 mois après le dernier échange, sauf obligation légale contraire.
          </p>

          <h2 id="partage-des-donnees">Partage des données</h2>
          <p>
            Les données personnelles ne sont ni vendues ni cédées à des tiers. Elles sont uniquement
            accessibles aux membres autorisés de l’association chargés du traitement des demandes.
          </p>

          <h2 id="securite-des-donnees">Sécurité des données</h2>
          <p>
            L’association met en œuvre des mesures raisonnables pour assurer la sécurité des données
            personnelles et empêcher tout accès non autorisé.
          </p>

          <h2 id="vos-droits">Vos droits</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li>droit d’accès ;</li>
            <li>droit de rectification ;</li>
            <li>droit d’effacement ;</li>
            <li>droit d’opposition ;</li>
            <li>droit à la limitation du traitement.</li>
          </ul>
          <p>
            Pour exercer ces droits, vous pouvez contacter{' '}
            <a href="mailto:randonneestouloises@gmail.com">randonneestouloises@gmail.com</a>. Vous
            pouvez également adresser une réclamation à la CNIL.
          </p>

          <h2 id="cookies">Cookies</h2>
          <p>
            Le site ne dépose pas de cookies à des fins publicitaires ou de suivi. Des cookies
            techniques nécessaires au bon fonctionnement du site peuvent toutefois être utilisés.
          </p>

          <h2 id="modification-de-la-politique">Modification de la politique</h2>
          <p>
            Cette politique de confidentialité peut être modifiée à tout moment afin de rester
            conforme à la législation en vigueur.
          </p>

          <hr />
          <p className="text-muted-foreground text-sm">Dernière mise à jour : 21 mai 2026.</p>
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description:
    'Politique de confidentialité de l’association Randonnées Touloises : données collectées, finalités, conservation et vos droits (RGPD).',
  openGraph: mergeOpenGraph({
    title: 'Politique de confidentialité',
    url: '/privacy',
  }),
  title: 'Politique de confidentialité',
}
