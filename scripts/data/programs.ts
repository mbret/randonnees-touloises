/**
 * The club's programme as published on the previous randonnees-touloises.net, in
 * the shape src/collections/Posts expects.
 *
 * This is a port, not a rewrite: the titles keep the date and the registration
 * deadline the club puts in them, and the wording is theirs — the site can be
 * improved once it holds what the old one held. The only liberties taken are
 * sentence case, since the legacy titles are shouted by CSS rather than written
 * that way, and short slugs, because the legacy URLs are copies of whichever
 * entry was duplicated to make them (« lac du der » lives at `…-neufchateau-…`).
 *
 * The legacy pages kept most of the description in images: a screenshot of a
 * Word document or a poster. Those are transcribed here so the text lands in the
 * CMS as text — searchable, readable on a phone, editable by the club. The
 * séjours are the exception; their PDFs are password-protected, so they are
 * re-uploaded as they are and linked.
 */
export type SeedProgramFile = {
  /** The link's text, or the alt text when the file is shown as an image. */
  label: string
  /** Where the file still is on the previous site. */
  url: string
  /** What it is called once in media. */
  filename: string
}

export type SeedProgramEntry = {
  title: string
  /** Kept short and stable rather than derived from the long legacy title. */
  slug: string
  /** `YYYY-MM-DD`, the day the outing happens. */
  startDate: string
  /** `YYYY-MM-DD`, for the séjours and the week-ends. */
  endDate?: string
  /**
   * The entry in the club's words, one item per line. `[texte](url)` becomes a
   * link and `![texte alternatif](cible)` alone on a line becomes an image, with
   * a `file:<filename>` target in either resolving to the uploaded media.
   */
  content: string
  files?: SeedProgramFile[]
}

const legacyUpload = (id: string, extension: string) =>
  `https://files.cdn-files-a.com/uploads/1204632/normal_${id}.${extension}`

const PDF = (filename: string, id: string): SeedProgramFile => ({
  filename,
  label: 'Contenu protégé — cliquez ici pour accéder aux informations (PDF)',
  url: legacyUpload(id, 'pdf'),
})

export const programEntries: SeedProgramEntry[] = [
  {
    title:
      'Sortie journée Brin sur Seille du 18 août 2026 (date limite d’inscription 01 août 2026)',
    slug: 'sortie-journee-brin-sur-seille',
    startDate: '2026-08-18',
    content: `Organisatrice : Patricia 06 73 97 19 14
[Je m’inscris](https://forms.gle/A4gMuR5rNz9QKVeH9)
Sortie journée Brin sur Seille, le 18/08.
Rendez-vous sur le parking anciennement Colryut à 8h15 pour un départ à 8h30 (covoiturage).
Départ de la randonnée à 9h30 (rendez-vous sur le parking en face du restaurant le Brin de Causette).
Départ / Arrivée : N 48.778296° / E 6.356086°
Randonnée : 6.400 kms et D 67 m
Restaurant le Brin de Causette. Menu : lasagnes et salade verte avec dessert du jour, 16.90 €. Apéritif, boissons et café en supplément.
14h30 : visite de l’arborétum d’Amance.`,
  },
  {
    title: 'Sortie journée Neufchateau du 24 août 2026 (date limite d’inscription 22 août 2026)',
    slug: 'sortie-journee-neufchateau',
    startDate: '2026-08-24',
    content: `Organisateur : Doudou 06 10 53 87 81
[Je m’inscris](https://forms.gle/M7gyKeYQ19tKSzuR9)`,
  },
  {
    // The poster is a designed one rather than a screenshot of a document, so it
    // is kept as the image it is. Its text lives in the alt below, which is the
    // only place left for a reader who cannot see it.
    title:
      'Sortie journée Lac du Der du 15 septembre 2026 (date limite d’inscription 01 septembre 2026)',
    slug: 'sortie-journee-lac-du-der',
    startDate: '2026-09-15',
    content: `[Je m’inscris](https://forms.gle/89QTKvutoadTrqke7)
![affiche](file:sortie-lac-du-der-2026.png)`,
    files: [
      {
        filename: 'sortie-lac-du-der-2026.png',
        label:
          'Sortie à la journée au lac du Der le 15 septembre 2026, organisée par Patricia — 06 73 97 19 14. ' +
          'RDV à 8h30, co-voiturage « Intermarché contact » (anciennement Colryut), 50 € par voiture à diviser ' +
          'par le nombre de personnes. Matin (10h00) : randonnée au départ du port de Giffaumont, 7,5 km et D+ 23 m. ' +
          'Repas au port de Giffaumont, « restaurant l’assiette du lac », avec choix entre deux menus proposés après ' +
          'le changement de la carte en septembre. Après-midi : balade en bateau « au fil de l’eau » sur le lac du Der, ' +
          'à la découverte de la faune et de la flore, le capitaine racontant l’historique et le fonctionnement du lac. ' +
          '10 € par personne, 9 € à partir de 10 personnes. Inscription obligatoire.',
        url: legacyUpload('6a32ce2fde6f6', 'png'),
      },
    ],
  },
  {
    title:
      'Marche breathwalk du 18 septembre 2026 (date limite d’inscription 10 septembre 2026) -- réservé aux adhérent(e)s --',
    slug: 'marche-breathwalk',
    startDate: '2026-09-18',
    content: `Renseignements : Pascal 07 88 26 43 84
Nombre de places : 10
[Je m’inscris](https://forms.gle/zrvwKQ3jC4zsXkDQ7)
Marche Breathwalk — marche consciente de Kundalini Yoga, avec Kundalini Yoga Lorraine.
Il ne faut pas de connaissances de Yoga, il suffit d’avoir la capacité de marcher pendant 1h30 sans parler, ni bâton ni sac à dos.
Les bienfaits : respirer c’est la vie, alignement des centres énergétiques (chakras), équilibre du mental et du corps, re-dynamisation, bien-être immédiat.
Lieu : étangs de Chaudeney.
C’est une marche consciente de Kundalini Yoga : marcher en synchronisant le souffle, les pas et l’attention.
Une séance comporte 5 étapes : éveil du corps et échauffement ; alignement du corps et conscience de chaque pas ; marche rythmée et consciente ; on récite mentalement un mantra, pratique de mudras (yoga des doigts) ; détente et étirements pour terminer par une méditation guidée.
C’est une marche SILENCIEUSE : pas de sac à dos, pas de bâtons, pas de bouteille ni de gourde.
Bien que ce soit une marche de Yoga, il ne faut pas de connaissances particulières, il suffit de pouvoir marcher à un bon rythme sans interruption pendant plus d’une heure.`,
  },
  {
    title:
      'Journée interclubs du samedi 19 septembre 2026 organisée par le Comité Départemental 54',
    slug: 'journee-interclubs',
    startDate: '2026-09-19',
    content: `[Je m’inscris](https://forms.gle/7c5QjegnhgkJ57uL8)
Rencontre interclubs, rando santé et marche douce, le 19 septembre 2026 au château de St-Max.
Gratuit. Repas tiré du sac. Transport en autocar possible.
Départ des autocars depuis les 3 coins du département, les lieux de prise en charge et les horaires étant précisés lors de la confirmation d’inscription : 06h55 Herserange puis passage à Briey, 07h55 Lunéville, 08h20 Toul. Ramassages intermédiaires possibles.
Le transport en autocar (50 places) sera assuré sous réserve d’un nombre suffisant d’inscrits, sinon envisager le covoiturage.
9h00 : arrivée des autocars et rendez-vous pour les individuels sur le parvis arrière du château de St Max, pont de la Meurthe. Accueil autour d’un petit café / brioche offert par le comité (salle intérieur château).
9h30 : présentation des intervenants et de quelques thématiques abordées au cours des randos et dans la journée.
Départ rando santé (boucle de 4 km) sur les rives de Meurthe avec un professionnel du Sport / Santé / Handicap.
Départ rando douce (boucle de 6 km) vers l’île du Foulon avec le Centre Permanent d’Initiatives pour l’Environnement (CPIE).
12h30 : retour des randonneurs au château pour un repas tiré du sac, apéritif commun offert par le comité.
13h30 : intervention de professionnels de la santé et de l’environnement en lien avec l’activité de rando douce — sport / santé : médecin du sport, professionnel du sport ; info et prévention sur les tiques et la maladie de Lyme : le Centre de Référence des Maladies Vectorielles à Tiques (CRMVT) du CHU et le CPIE.
16h00 : fin de la journée, retour aux autocars.
FFRandonnée Meurthe-et-Moselle — 03 83 18 87 36, meurthe-et-moselle@ffrandonnee.fr`,
  },
  {
    title:
      'Sortie journée Lay Saint Christophe du dimanche 20 septembre 2026 (date limite d’inscription 18 septembre 2026)',
    slug: 'sortie-journee-lay-saint-christophe',
    startDate: '2026-09-20',
    content: `Organisatrice : Isabelle 06 84 62 62 52
[Je m’inscris](https://forms.gle/k88R5fVRgkY2Bnga6)`,
  },
  {
    title:
      'Sortie journée au Bonhomme - grand brézouard du 24 septembre 2026 (date limite d’inscription 22 septembre 2026)',
    slug: 'sortie-journee-au-bonhomme-grand-brezouard',
    startDate: '2026-09-24',
    content: `Organisateur : Jean Marie 07 81 11 20 47
[Je m’inscris](https://forms.gle/E7N9YGo8PJnF4iiNA)`,
  },
  {
    title:
      'Séjour Val de Loire du 04 au 11 octobre 2026 (inscription liste d’attente) -- réservé aux adhérent(e)s --',
    slug: 'sejour-val-de-loire',
    startDate: '2026-10-04',
    endDate: '2026-10-11',
    content: `[Contenu protégé — cliquez ici pour accéder aux informations (PDF)](file:sejour-val-de-loire-2026.pdf)
Pour obtenir le code, contactez la responsable I. Anderlini au 06 84 62 62 52.`,
    files: [PDF('sejour-val-de-loire-2026.pdf', '697ef5cb9d4c8')],
  },
  {
    title:
      'Séjour raquettes Val Cenis du 30 janvier au 06 février 2027 -- réservé aux adhérent(e)s --',
    slug: 'sejour-raquettes-val-cenis',
    startDate: '2027-01-30',
    endDate: '2027-02-06',
    content: `[Contenu protégé — cliquez ici pour accéder aux informations (PDF)](file:sejour-raquettes-val-cenis-2027.pdf)
Pour obtenir le code, contactez la responsable Jean-Marie MAZELIN au 07 81 11 20 47.`,
    files: [PDF('sejour-raquettes-val-cenis-2027.pdf', '69e26327e73a2')],
  },
  {
    title: 'Séjour PERIGORD du 03 au 10 avril 2027 -- réservé aux adhérent(e)s --',
    slug: 'sejour-perigord',
    startDate: '2027-04-03',
    endDate: '2027-04-10',
    content: `[Contenu protégé — cliquez ici pour accéder aux informations (PDF)](file:sejour-perigord-2027.pdf)
Pour obtenir le code, contactez le responsable JM Mazelin au 07 81 11 20 47.`,
    files: [PDF('sejour-perigord-2027.pdf', '69b512476415d')],
  },
  {
    title: 'Séjour NOIRMOUTIER du 08 au 15 mai 2027 -- réservé aux adhérent(e)s --',
    slug: 'sejour-noirmoutier',
    startDate: '2027-05-08',
    endDate: '2027-05-15',
    content: `[Contenu protégé — cliquez ici pour accéder aux informations (PDF)](file:sejour-noirmoutier-2027.pdf)
Pour obtenir le code, contactez le responsable Patricia MORELE au 06 73 97 19 14.`,
    files: [PDF('sejour-noirmoutier-2027.pdf', '6a21bbec55400')],
  },
]
