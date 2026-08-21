import type { Metadata } from 'next/types'

import { servedAt } from '@/seo/servedAt'
import Link from 'next/link'
import React from 'react'

export default function Page() {
  return (
    <div className="pt-24 pb-24">
      <div className="container">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Règlement intérieur</h1>
          <p className="lead">Association Randonnées Touloises</p>

          <ul>
            <li>Approuvé par l’Assemblée Générale du 17 Novembre 2001</li>
            <li>
              Article 11 modifié le 10 Novembre 2007 lors de l’Assemblée Générale Extraordinaire
            </li>
            <li>Mis à jour lors de l’Assemblée Générale Extraordinaire du 07 Novembre 2009</li>
            <li>
              Modifié et mis à jour le 17 Novembre 2012 lors de l’Assemblée Générale Extraordinaire
            </li>
            <li>Modifié le 16 Novembre 2013 lors de l’Assemblée Générale Extraordinaire</li>
            <li>Modifié le 19 Novembre 2016 lors de l’Assemblée Générale</li>
            <li>Modifié le 18 Février 2021 lors de l’Assemblée Générale</li>
            <li>Modifié par le CA le 1er janvier 2022</li>
            <li>Modifié par le CA le 11 décembre 2024, approuvé à l’AG du 21/02/2025</li>
            <li>Modifié par le CA le 13 février 2026</li>
          </ul>

          <p>Rappel des événements marquants de la constitution de l’Association :</p>
          <ul>
            <li>
              <strong>1987</strong> : Année de création
            </li>
            <li>
              <strong>1992</strong> : Membre de la Fédération Française de Randonnée Pédestre (FFRP)
            </li>
            <li>
              <strong>1995</strong> : Reçoit l’agrément du ministère de la Jeunesse et des Sports
            </li>
            <li>
              <strong>2001</strong> : Reconnue en tant qu’Association Sportive de la Ville de TOUL
            </li>
            <li>
              <strong>2019</strong> : Obtention du label Santé délivré par la FFRandonnée
            </li>
          </ul>

          <p>
            Conformément à l’article 21 des statuts de l’Association, sont instaurées les
            dispositions qui suivent sous la dénomination de «&nbsp;Règlement Intérieur de
            l’Association Randonnées Touloises&nbsp;», afin de compléter et préciser les règles
            d’application desdits statuts.
          </p>
          <p>Le présent règlement sera communiqué à tout nouvel adhérent.</p>

          <h2 id="adherents">1. Adhérents</h2>

          <h3 id="adhesion">1.1 Adhésion</h3>
          <p>L’adhésion, obligatoire, se compose de deux parties :</p>
          <ul>
            <li>
              <p>
                la <strong>licence</strong> (dématérialisée) qui est délivrée par la Fédération
                Française de Randonnée. La période de validité de la licence est du 1er septembre de
                l’année N au 31 août de l’année N+1.
              </p>
              <p>
                Conjointement à la licence, chaque licencié(e) est obligatoirement assuré(e) en
                catégorie IRA (responsabilité civile, dommages corporels, rapatriement). Cette
                assurance également délivrée par la Fédération Française de Randonnée est valide du
                1er septembre de l’année N au 31 décembre de l’année N+1. C’est la Fédération
                Française de Randonnée qui, chaque année, fixe le tarif de la licence + assurance.
                Les adhérents titulaires d’une licence dans un autre club FFRandonnée acquitteront
                uniquement le prix de la cotisation.
              </p>
              <p>
                Pour les animateurs, le coût de la licence (+ assurance) est pris en charge par
                l’Association, sous réserve d’assurer annuellement 6 conduites de randonnées.
              </p>
            </li>
            <li>
              la <strong>cotisation</strong> à l’association dont le montant est fixé une fois par
              an par le CA. Elle est due pour la période du 1er septembre de l’année N au 31 août de
              l’année N+1.
            </li>
          </ul>
          <p>Les renouvellements d’adhésions doivent être clos au 30/10 de l’année N.</p>
          <p>
            Un futur adhérent a droit à une période d’essai. Il lui sera possible d’effectuer 3
            sorties maximum (non couvertes par l’assurance fédérale) avant de s’inscrire
            définitivement.
          </p>
          <p>Un certificat médical (CACI) sera demandé pour toute nouvelle adhésion.</p>

          <h3 id="programmes-de-randonnees">1.2 Programmes de randonnées</h3>
          <p>
            Pour les adhérents, les programmes de randonnées comportent pour chaque sortie, les
            horaires, les lieux de rendez-vous, les informations particulières et les noms des
            animateurs. Pour que chaque adhérent puisse apprécier la difficulté de la randonnée
            proposée, les animateurs communiqueront le kilométrage et le dénivelé cumulé positif de
            la randonnée.
          </p>
          <p>
            La diffusion en sera faite sur le site Internet{' '}
            <Link href="/">https://www.randonnees-touloises.net/</Link>
          </p>
          <p>
            La publicité sera réalisée essentiellement sur le site Internet{' '}
            <Link href="/">https://www.randonnees-touloises.net/</Link> et pourra être complétée par
            l’intermédiaire du journal local l‘Est Républicain, les panneaux lumineux et autres
            documentations de la Ville de Toul. La publicité mettra plus particulièrement en valeur
            les activités nouvelles et les sorties exceptionnelles.
          </p>

          <h3 id="obligations-du-randonneur">1.3 Obligations du randonneur</h3>
          <p>
            Le randonneur s’engage à respecter les consignes données par les animateurs lors des
            sorties. Il s’assure que ses capacités physiques sont compatibles avec l’activité de son
            choix. Il doit respecter le rythme de la sortie et non pas vouloir faire appliquer le
            sien au groupe. Il respecte l’environnement et la sécurité imposée par l’animateur.
          </p>

          <h2 id="administration">2. Administration</h2>

          <h3 id="formation-des-administrateurs">
            2.1 Formation des administrateurs et la représentativité de l’Association
          </h3>
          <p>
            Les dirigeants ne sont pas tenus de suivre une formation spécifique. Cependant, des
            formations sont dispensées par différents organismes agréés ainsi que par la
            FFRandonnée, sur les différents points de gestion (comptabilité, responsabilité des
            dirigeants, communication…). Le(La) Président(e) informe les dirigeants de ces
            possibilités ; les intéressés font part de leur intention au CA qui avalise ou non leur
            demande. L’Association invite chaque dirigeant(e) à perfectionner ses connaissances.
          </p>

          <h3 id="remboursement-de-frais">
            2.2 Remboursement de frais aux administrateurs (formation ou représentativité)
          </h3>
          <p>Les frais de formation ou de représentativité seront remboursés :</p>
          <ul>
            <li>
              sur justificatif des dépenses engagées pour les frais de repas et d’hébergement, avec
              un maximum de 20,70 € par repas (barème URSSAF 2024) et 80,00 € par nuitée (petit
              déjeuner compris) ;
            </li>
            <li>
              pour les trajets, les dépenses seront remboursées sur la base du barème kilométrique
              fiscal en vigueur.
            </li>
          </ul>

          <h3 id="assurances">2.3 Assurances</h3>
          <p>
            Les Randonnées Touloises devront chaque année assurer le local mis à disposition par la
            Ville de Toul au 02, cours Raymond Poincaré à Toul 54200. La responsabilité civile de
            l’association pour son fonctionnement (réunions, randonnées, etc.) est assurée par la
            FFRandonnée gratuitement. Pour toutes les autres manifestations, Randonnées Touloises
            contactera son assureur local ou la Fédération.
          </p>

          <h3 id="historique-et-archives">2.4 Historique et archives de l’Association</h3>
          <p>
            À l’issue de chaque réunion (Assemblée Générale Ordinaire et/ou Extraordinaire, Conseil
            d’Administration), il sera établi un procès-verbal de séance, visé par le(la)
            Président(e) ou le(la) Secrétaire, ou à défaut tout autre membre du Conseil habilité.
          </p>
          <p>
            Depuis 2023, toutes les traces du secrétariat sont enregistrées sous forme
            dématérialisée de manière sécurisée dans le «&nbsp;cloud&nbsp;» GOOGLE.
          </p>
          <p>
            Chaque opération comptable est enregistrée sur ordinateur depuis septembre 2018 et
            sauvegardée régulièrement ; cette comptabilité par charges et produits est vérifiée
            chaque année par les Vérificateurs aux Comptes nommés par l’Assemblée Générale.
          </p>

          <h3 id="informatique">2.5 Informatique</h3>
          <p>
            Notre association collecte dans un fichier informatique des données personnelles des
            adhérents, fait des photos, communique par messagerie et interface web. Elle applique
            les règles définies par le Règlement Européen sur la Protection des Données Personnelles
            (RGPD).
          </p>

          <h2 id="animateurs">3. Animateurs</h2>

          <h3 id="qualifications">3.1 Qualifications</h3>
          <p>
            Aucun texte légal réglementaire ou fédéral n’impose à ce jour la possession d’un diplôme
            pour la conduite bénévole d’une randonnée associative. De ce fait, l’Association était
            libre d’en confier à ceux et à celles qu’elle estimait aptes à y faire face. À compter
            de 2019, tout nouvel animateur/animatrice devra avoir reçu la formation de base (CARP)
            dispensée par la FFRandonnée. Sans cette formation, aucune randonnée ne pourra lui être
            confiée, sauf autorisation écrite par le(a) Président(e). Tout animateur/animatrice doit
            posséder le diplôme de 1er secours (PSC1) délivré par la Croix Rouge ou un autre
            organisme agréé. Un recyclage doit être effectué tous les 5 ans.
          </p>
          <p>
            Par notre adhésion à la FFRandonnée et le fait de licencier tous nos adhérents avec des
            licences IRA, l’animateur bénéficie de la même garantie de responsabilité civile que son
            association à l’égard des randonneurs qu’il encadre. Sa licence le couvre le jour de
            l’animation non seulement comme randonneur mais aussi comme animateur. Cette couverture
            ne s’applique que lorsque l’animateur s’exprime dans le cadre de son association ou dans
            le cadre d’une autre association fédérée.
          </p>
          <p>
            Les personnes intéressées seront prévenues des dates et thèmes de stages dès que le(la)
            Président(e) en a connaissance.
          </p>

          <h3 id="aide-financiere-aux-formations">3.2 Aide financière aux formations</h3>
          <p>
            Toute personne ayant été autorisée par le CA à suivre une formation peut demander la
            participation de l’Association aux frais des stages et de formation. Pour les formations
            d’animateur, les frais seront réglés directement par l’association à la FFRandonnée
            après déduction le cas échéant des participations des comités régionaux et
            départementaux.
          </p>

          <h3 id="preparation-et-animation-des-sorties">
            3.3 Préparation et animation des sorties
          </h3>
          <p>
            Afin de préparer les circuits de randonnées, les animateurs/animatrices ont la
            possibilité d’utiliser le matériel ad-hoc de l’Association (cartes et topoguides). Ils
            pourront également utiliser un appareil nomade (GPS, smartphone) ou ordinateur
            (applications de randonnées).
          </p>
          <p>
            L’animateur doit obligatoirement être muni d’une trousse de secours. Celle-ci est
            fournie par l’association à chaque animateur. Le renouvellement des manques et articles
            périmés sera assuré par l’Association. Pour des raisons de sécurité, il est recommandé à
            l’animateur d’être porteur d’un téléphone portable afin de pouvoir prévenir les secours
            en cas d’accident.
          </p>

          <h3 id="declaration-fiscale">3.4 Déclaration fiscale</h3>
          <p>
            Chaque année fiscale, il sera possible à l’animateur d’établir une fiche de frais qui
            sera obligatoirement transformée en don à l’Association. Celle-ci pourra permettre à
            l’animateur d’avoir une réduction fiscale en fonction des textes en vigueur (cerfa
            n°&nbsp;11580*05). L’animateur a la possibilité de déclarer les km (A/R) effectués avec
            son véhicule entre son domicile et les lieux de départs des randonnées (y compris les
            reconnaissances effectuées) qu’il anime. Seules les randonnées inscrites au programme
            hebdomadaire sont prises en compte.
          </p>
          <p>
            Pour les séjours, en cas de reconnaissances uniquement, ce sont les km (A/R) du domicile
            au lieu d’hébergement + les km (A/R) de l’hébergement aux départs des étapes.
          </p>

          <h2 id="animations">4. Animations</h2>

          <h3 id="types-d-animations">4.1 Les types d’animations</h3>
          <p>
            Comme stipulé dans nos statuts, notre association s’est chargée de développer la
            randonnée dans le Toulois à travers ses différentes actions, et de participer à sa mise
            en valeur touristique. Dans ce but, notre Association organise différentes animations :
          </p>
          <ul>
            <li>randonnée pédestre (petite et grande) les lundis et jeudis toute l’année ;</li>
            <li>randonnée pédestre (santé ou douce) les mardis et vendredis toute l’année ;</li>
            <li>les sorties à thème peuvent être organisées chaque jour de la semaine ;</li>
            <li>
              la marche nordique est programmée tous les vendredis, sauf le 1er trimestre, 1
              vendredi sur 2.
            </li>
          </ul>
          <p>
            Les parcours sont connus ou reconnus par les animateurs. Les km et D+ sont précisés,
            suivant le niveau, dans l’agenda du mois en cours consultable sur le site internet de
            l’association.
          </p>
          <p>Principales caractéristiques des randonnées proposées :</p>
          <ul>
            <li>rando petite (8 à 11 km) à la 1/2 journée à 4 km/h de moyenne maxi ;</li>
            <li>rando grande (11 à 15 km) à la 1/2 journée à 4 km/h de moyenne maxi ;</li>
            <li>marche nordique de 2 ou 2h30 ;</li>
            <li>rando santé ou douce (6 à 7 km) de 3h maxi.</li>
          </ul>
          <p>
            La pratique de la marche nordique est une activité proposée par l’Association. Elle se
            pratique par séances de deux ou deux heures trente sous la direction d’un animateur
            breveté en marche nordique par la Fédération Française de Randonnée.
          </p>
          <p>
            S’agissant d’une activité sportive, elle comprend obligatoirement des exercices
            d’échauffements et d’étirements qui devront être suivis par les participants. Les bâtons
            spécifiques sont obligatoires, ils sont à la charge du pratiquant.
          </p>

          <h3 id="covoiturage">4.2 Covoiturage</h3>
          <p>
            L’organisateur d’une sortie hebdomadaire pourra prévoir un rassemblement sur Toul pour
            regrouper les participants dans les différents véhicules lors de sorties à l’extérieur
            les plus éloignées de Toul. Le coût du covoiturage, limité aux frais d’essence (sur la
            base du tarif kilométrique fixé annuellement par le CA) et de péage, sera réparti
            équitablement entre les personnes de chaque véhicule.
          </p>
          <p>
            Dans le cadre d’un séjour, le coût du covoiturage doit être calculé au plus juste avec
            une répartition équitable entre tous les participants quel que soit le mode de transport
            utilisé (voiture ou minibus) et le nombre de personnes par véhicule. Le budget de
            covoiturage sera géré directement par l’organisateur du séjour.
          </p>
          <p>
            Le conducteur atteste être titulaire du permis de conduire (valide) et avoir souscrit
            une assurance avec la responsabilité civile (obligatoire).
          </p>

          <h2 id="sejours">5. Séjours</h2>

          <h3 id="responsable-des-sejours">
            5.1 Responsable des séjours ou des journées d’activités
          </h3>
          <p>
            L’ensemble des séjours hors itinérants ou les journées d’activités ne pourront être
            confiés qu’aux animateurs ou aux membres du Comité d’Administration. Pour les séjours
            organisés sans sous-traitance, les conduites de randonnées doivent obligatoirement se
            faire avec des animateurs certifiés ou brevetés.
          </p>
          <p>
            Un séjour itinérant est organisé, sous la responsabilité d’un animateur titulaire du
            Brevet Fédéral ou sous la responsabilité d’un guide local, cette dernière option étant
            de règle lorsque nous allons en montagne et lorsqu’aucun animateur de l’Association n’a
            la qualification nécessaire. En cas de séjour donné en sous-traitance, seul
            l’organisateur a le rôle d’intermédiaire entre le groupe et les prestataires (centre de
            vacances, guide, chauffeur).
          </p>

          <h3 id="organisation-des-sejours">5.2 Organisation des séjours</h3>
          <p>
            <strong>Préparation et diffusion :</strong> l’organisateur a la responsabilité totale du
            séjour. Il gère les contacts avec le Centre de vacances, voire avec le transporteur, ou
            organise le covoiturage.
          </p>
          <p>
            Toute proposition doit être présentée au CA qui donnera ou non son accord. Une fois les
            modalités du voyage définies (devis, prestataires, …), une diffusion pour inscription
            sera faite par le(la) secrétaire. Il n’y aura pas de pré-inscriptions, ni de sondages.
          </p>
          <p>
            Les tarifs doivent inclure au plus près les prix des séjours, des transports et des
            différentes prestations prévues au programme (pots d’arrivée et de fin de séjour
            compris), ainsi que la gratification à accorder au guide et au chauffeur.
          </p>
          <p>
            <strong>Inscriptions :</strong> dès la diffusion, l’adhérent intéressé par le séjour
            pourra s’inscrire via le site de l’association et par le versement d’un acompte auprès
            de l’association. Les places seront retenues en fonction de leur date d’arrivée. En cas
            de dépassement du nombre de participants une liste d’attente sera établie.
          </p>
          <p>
            <em>Nota :</em> pour participer à un séjour il est obligatoire d’être adhérent
            (titulaire d’une licence FFRandonnée valide et à jour de cotisation à l’association).
            Priorité sera donnée à un adhérent de l’année N-1.
          </p>
          <p>
            <strong>Paiement du séjour :</strong>
          </p>
          <ul>
            <li>Un acompte de 30&nbsp;% sera demandé lors de l’inscription.</li>
            <li>Un ou plusieurs paiements étalés dans le temps seront définis.</li>
            <li>
              Dans tous les cas, le solde du voyage devra être payé 45 jours avant la date de
              départ.
            </li>
            <li>
              Un reliquat pourra être demandé aux participants pour des petites dépenses imprévues
              acceptées par l’ensemble du groupe lors du séjour.
            </li>
            <li>Aucune boisson non prévue ne sera prise en charge par l’organisateur.</li>
            <li>
              Les paiements s’effectuent par chèque bancaire ou moyens dématérialisés (virement ou
              carte bancaire).
            </li>
          </ul>
          <p>
            <strong>Assurance annulation :</strong>
          </p>
          <ul>
            <li>
              <em>séjours sous-traités à un organisme :</em> tous les séjours sous-traités à un
              organisme (centre de vacances ou autres) feront l’objet d’une assurance annulation
              obligatoire prise auprès du prestataire ;
            </li>
            <li>
              <em>séjours organisés par le club sans prestataire de services :</em> pour ces
              activités aucune assurance annulation n’est prescrite sauf cas particulier proposé à
              l’inscription.
            </li>
          </ul>
          <p>
            <strong>Annulation d’un séjour du fait de Randonnées Touloises :</strong> si Randonnées
            Touloises était amené à annuler un séjour, de son fait, soit pour circonstance de force
            majeure, soit pour insuffisance du nombre de participants, ou autre motif, les acomptes
            ou sommes versées seront remboursés aux participants prévus en tenant compte des
            retenues imposées par le transporteur ou l’hébergeur.
          </p>
          <p>
            <strong>Annulation d’un séjour à l’initiative de l’adhérent :</strong> l’annulation du
            séjour devra être signifiée par écrit à Randonnées Touloises. Le montant de la
            facturation des frais d’annulation s’établira ainsi :
          </p>
          <ul>
            <li>
              Si l’annulation intervient plus de 45 jours avant le début du séjour, la totalité de
              l’acompte (30&nbsp;% du montant) est conservée par Randonnées Touloises.
            </li>
            <li>
              Si l’annulation intervient entre 45 jours et 30 jours avant le début du séjour,
              50&nbsp;% du séjour est dû à Randonnées Touloises.
            </li>
            <li>
              Si l’annulation intervient entre 30 et 7 jours avant le début du séjour, 80&nbsp;% du
              séjour est dû.
            </li>
            <li>
              Si l’annulation intervient à moins de 7 jours du début du séjour, l’intégralité du
              montant du séjour est dû.
            </li>
          </ul>
          <p>
            Pour éviter tout frais à l’adhérent, celui-ci pourra céder sa place à un autre adhérent.
            Il sera alors remboursé de son séjour (par virement) dès que son remplaçant aura payé.
          </p>
          <p>
            <strong>Journées d’activités :</strong> mêmes modalités d’organisation et d’inscription
            que dans les rubriques précédentes.
          </p>
          <p>
            <strong>
              Participation d’un conjoint non adhérent à une activité (hors randonnée) :
            </strong>{' '}
            il est convenu que si le nombre de places est limité, priorité est donnée aux adhérents
            de l’association. Les conjoints non adhérents désirants s’inscrire à un événement
            règlent leur part en totalité et ne peuvent en aucun cas bénéficier de la participation
            du club.
          </p>
          <p>
            <em>Nota :</em> sur le document de présentation de l’activité, il devra être spécifié le
            remboursement ou le non remboursement de l’activité en cas de désistement de l’adhérent.
          </p>

          <hr />
          <p className="text-muted-foreground text-sm">Mise à jour du 13/02/2026.</p>
        </div>
      </div>
    </div>
  )
}

export const metadata: Metadata = {
  description:
    'Règlement intérieur de l’association Randonnées Touloises : adhésion, administration, animateurs, animations et séjours.',
  ...servedAt('/terms'),
  title: 'Règlement intérieur',
}
