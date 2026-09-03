import type { Metadata } from 'next/types'

import aboutHero from '@/assets/about-hero.webp'
import { Figure } from '@/components/common/Figure'
import { Card, CardContent } from '@/components/ui/card'
import { ABOUT_FIGURES } from '@/data/keyFigures'
import { servedAt } from '@/seo/servedAt'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function Page() {
  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-none">
          <h1>À propos de nous</h1>
          <p className="lead">
            Créée en 1987, l’association Randonnées Touloises s’impose aujourd’hui comme un acteur
            majeur de la randonnée pédestre en Meurthe-et-Moselle.
          </p>
        </div>

        <div className="my-12">
          <Image
            alt="Groupe de randonneurs sur un sentier de montagne"
            className="rounded-lg w-full h-auto"
            priority
            src={aboutHero}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-12 lg:grid-cols-4">
          {ABOUT_FIGURES.map(({ label, value }) => (
            <Card key={label}>
              <CardContent className="text-center">
                <p className="text-3xl">
                  <Figure>{value}</Figure>
                </p>
                <p className="text-muted-foreground text-sm mt-2">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p>
            Forte de son engagement et de son dynamisme, elle rejoint dès 1992 la Fédération
            Française de Randonnée Pédestre (FFRP), avant d’obtenir en 1995 l’agrément du ministère
            de la Jeunesse et des Sports, gage de sérieux et de qualité dans ses activités.
          </p>
          <p>
            Au fil des années, l’association n’a cessé de se développer et de promouvoir les
            bienfaits de la marche. En 2019, elle se voit décerner le label Santé par la Fédération
            Française de Randonnée Pédestre, reconnaissant ainsi son implication dans le sport
            accessible à tous et bénéfique pour le bien-être.
          </p>
          <p>
            Aujourd’hui, Randonnées Touloises compte 260 adhérents, ce qui en fait le premier club
            de Meurthe-et-Moselle en nombre de licenciés à la FFRP. L’année 2025 illustre
            parfaitement cette vitalité, avec pas moins de 59 000 kilomètres parcourus par les
            randonneurs.
          </p>
          <p>
            Encadrés par 20 animateurs et animatrices diplômés, les membres bénéficient d’un
            accompagnement de qualité pour découvrir les sentiers en toute sécurité, dans une
            ambiance conviviale et chaleureuse.
          </p>
          <p>
            Rejoindre Randonnées Touloises, c’est partager le plaisir de la randonnée, découvrir des
            paysages variés et s’inscrire dans une dynamique collective tournée vers la santé, la
            nature et le lien social.
          </p>
          <p>
            L’association recherche par ailleurs de nouveaux animateurs bénévoles :{' '}
            <Link href="/devenir-animateur">aucune expérience n’est exigée</Link>, la formation est
            prise en charge.
          </p>
          <p>
            Envie de nous rejoindre ou d’en savoir plus ?{' '}
            <Link href="/contact">Contactez-nous</Link> ou consultez notre{' '}
            <Link href="/terms">règlement intérieur</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description:
    'Créée en 1987, Randonnées Touloises est le premier club de Meurthe-et-Moselle en nombre de licenciés à la FFRandonnée : 260 adhérents, 20 animateurs diplômés, label Santé.',
  ...servedAt('/about'),
  title: 'À propos de nous',
}
