import type { Metadata } from 'next/types'

import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import Link from 'next/link'
import React from 'react'

const weeklyProgram = [
  { day: 'Lundi', outings: 'Petite randonnée (8 à 11 km) et Grande randonnée (11 à 15 km)' },
  { day: 'Mardi', outings: 'Randonnée Santé (5 à 6 km)' },
  { day: 'Jeudi', outings: 'Petite randonnée (8 à 11 km) et Grande randonnée (11 à 15 km)' },
  { day: 'Vendredi', outings: 'Randonnée Douce (6 à 7 km)' },
  { day: 'Dimanche (1 à 2 sorties par mois)', outings: 'Grande randonnée (15 à 25 km)' },
]

export default function Page() {
  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-3xl mx-auto">
          <h1>Nos activités</h1>
          <p className="lead">
            Les Randonnées Touloises proposent des activités variées tout au long de l’année,
            adaptées à tous les niveaux et à toutes les envies.
          </p>

          <h2 id="randonnees-pedestres">Randonnées pédestres</h2>
          <p>Plusieurs niveaux sont proposés chaque semaine :</p>
          <table>
            <thead>
              <tr>
                <th>Jour</th>
                <th>Sorties</th>
              </tr>
            </thead>
            <tbody>
              {weeklyProgram.map(({ day, outings }) => (
                <tr key={day}>
                  <td>{day}</td>
                  <td>{outings}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 id="marche-nordique">Marche nordique</h2>
          <p>Chaque vendredi, en séance d’environ 2 heures.</p>

          <h2 id="sorties-a-la-journee">Sorties à la journée</h2>
          <p>
            Tout au long de l’année, pour découvrir de nouveaux paysages dans une ambiance
            conviviale. Distance de 15 à 25 km, avec repas tiré du sac ou restauration.
          </p>

          <h2 id="sejours">Séjours (réservés aux adhérents)</h2>
          <p>
            Chaque année, le club organise des séjours permettant de partager plusieurs jours de
            randonnée dans une ambiance chaleureuse :
          </p>
          <ul>
            <li>séjours en étoile, pour tous les niveaux ;</li>
            <li>séjours itinérants, pour les plus sportifs ;</li>
            <li>séjours raquettes en période hivernale.</li>
          </ul>
          <p>
            Les modalités d’inscription et d’annulation des séjours sont détaillées dans notre{' '}
            <Link href="/terms">règlement intérieur</Link>.
          </p>

          <h2 id="participer">Participer</h2>
          <p>
            Les horaires, les lieux de rendez-vous, le kilométrage et le dénivelé de chaque sortie
            sont publiés dans le <Link href="/#agenda">programme</Link>. Une question sur une
            activité ? <Link href="/contact">Écrivez-nous</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description:
    'Randonnées pédestres de tous niveaux, marche nordique, sorties à la journée et séjours : découvrez les activités des Randonnées Touloises.',
  openGraph: mergeOpenGraph({
    url: '/activities',
  }),
  title: 'Nos activités',
}
