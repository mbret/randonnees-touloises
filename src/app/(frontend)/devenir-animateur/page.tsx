import type { Metadata } from 'next/types'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { mergeOpenGraph } from '@/seo/mergeOpenGraph'
import { Compass, HeartHandshake, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

/**
 * What an animateur is signing up for, taken from the recruitment poster. The
 * poster says the same thing in a picture; saying it in text as well is what
 * makes it reachable by search and by a screen reader.
 */
const promises = [
  {
    Icon: Compass,
    title: 'Proposez des randonnées',
    description:
      'Choisissez vos itinéraires, reconnaissez-les à votre rythme et faites découvrir les sentiers que vous aimez.',
  },
  {
    Icon: HeartHandshake,
    title: 'Partagez votre passion',
    description:
      'Transmettez votre goût de la nature et de la marche à des adhérents de tous niveaux, du parcours santé à la grande randonnée.',
  },
  {
    Icon: Users,
    title: 'En toute convivialité',
    description:
      'Rejoignez une équipe de vingt animateurs et animatrices qui préparent les sorties ensemble et se relaient tout au long de l’année.',
  },
]

export default function Page() {
  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-3xl mx-auto">
          <h1>Devenez animateur bénévole !</h1>
          <p className="lead">
            Les Randonnées Touloises recrutent. Partagez votre passion de la nature et guidez nos
            adhérents sur les sentiers.
          </p>
        </div>

        <div className="grid gap-12 items-start my-12 max-w-5xl mx-auto lg:grid-cols-[3fr_2fr]">
          <div className="grid gap-4 order-2 lg:order-1">
            {promises.map(({ Icon, title, description }) => (
              <Card key={title}>
                <CardContent className="flex gap-4">
                  <Icon aria-hidden className="size-6 shrink-0 text-primary mt-1" />
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-muted-foreground text-sm mt-1">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Image
            alt="Affiche : devenez animateur bénévole aux Randonnées Touloises. Proposez des randonnées, partagez votre passion, en toute convivialité. Aucune expérience exigée."
            className="rounded-lg w-full h-auto order-1 lg:order-2"
            height={1007}
            priority
            src="/recrutement-animateurs.webp"
            width={674}
          />
        </div>

        <div className="prose dark:prose-invert max-w-3xl mx-auto">
          <h2 id="aucune-experience-exigee">Aucune expérience exigée</h2>
          <p>
            Pas besoin d’être un randonneur chevronné ni de posséder un diplôme : il suffit d’aimer
            la nature, la marche et la bonne humeur. L’association prend en charge la formation
            fédérale de ses animateurs et vous accompagne sur vos premières sorties, aux côtés d’un
            animateur expérimenté.
          </p>

          <h2 id="ce-que-nous-demandons">Ce que nous demandons</h2>
          <ul>
            <li>être adhérent de l’association et licencié à la FFRandonnée ;</li>
            <li>
              encadrer quelques sorties dans l’année, selon vos disponibilités — personne ne
              s’engage sur un rythme hebdomadaire ;
            </li>
            <li>reconnaître son parcours avant de le proposer, seul ou accompagné ;</li>
            <li>veiller à ce que le groupe marche en sécurité et rentre au complet.</li>
          </ul>

          <h2 id="rejoignez-nous">Rejoignez-nous</h2>
          <p>
            Envie d’en discuter sans vous engager ? Écrivez-nous, ou venez en parler à un animateur
            lors d’une prochaine sortie.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Button asChild size="lg">
            <a href="mailto:randonneestouloises@gmail.com?subject=Devenir%20animateur%20b%C3%A9n%C3%A9vole">
              Écrire à l’association
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">Utiliser le formulaire de contact</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description:
    'Les Randonnées Touloises recrutent des animateurs bénévoles. Aucune expérience exigée : la formation fédérale est prise en charge par l’association.',
  openGraph: mergeOpenGraph({
    url: '/devenir-animateur',
  }),
  title: 'Devenez animateur bénévole',
}
