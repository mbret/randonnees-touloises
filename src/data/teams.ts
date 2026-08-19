import type { TeamMember } from '@/components/TeamSection/TeamSection'

/**
 * A member as written down here: same shape as the `teamDirectory` global's
 * `teamMembers` field, except the portrait is referenced by media filename. Ids
 * are per-database sequences, so the pages resolve the filename at render time.
 */
export type StaticTeamMember = Omit<TeamMember, 'media'> & { photo?: string }

/**
 * Team listings kept in code so the pages can ship before the `teamDirectory`
 * entries exist in the CMS. Portraits come from scripts/import-team-photos.ts,
 * which keys each file on the member's full name.
 */
export const boardMembers: StaticTeamMember[] = [
  { name: 'Pascal BRET', role: 'Président', photo: 'conseil-pascal-bret.png' },
  { name: 'Suzanne ROCHEFOLLE', role: 'Vice Présidente', photo: 'conseil-suzanne-rochefolle.png' },
  { name: 'Isabelle ANDERLINI', role: 'Secrétaire', photo: 'conseil-isabelle-anderlini.png' },
  { name: 'Alain GAUDE', role: 'Trésorier', photo: 'conseil-alain-gaude.png' },
  { name: 'Daniel BERTEAUX', role: 'Référent Santé', photo: 'conseil-daniel-berteaux.png' },
  { name: 'Jean-Marie MAZELIN', role: 'Référent Voyages', photo: 'conseil-jean-marie-mazelin.png' },
  { name: 'Muriel TARAL', role: 'Référente Animations', photo: 'conseil-muriel-taral.png' },
  {
    name: 'Anne-Marie OUELDENNAOUA',
    role: 'Secrétaire adjointe',
    photo: 'conseil-anne-marie-oueldennaoua.png',
  },
  { name: 'Abdelatif OUELDENNAOUA', role: 'Membre', photo: 'conseil-abdelatif-oueldennaoua.png' },
  { name: 'Pascal MELIN', role: 'Membre', photo: 'conseil-pascal-melin.png' },
  { name: 'Philippe NEUVILLERS', role: 'Membre', photo: 'conseil-philippe-neuvillers.png' },
  { name: 'Denis CHATELAIN', role: 'Membre', photo: 'conseil-denis-chatelain.png' },
  { name: 'Daniel ROCHEFOLLE', role: 'Membre', photo: 'conseil-daniel-rochefolle.png' },
  { name: 'Pierre REVEST', role: 'Membre', photo: 'conseil-pierre-revest.png' },
  {
    name: 'Christophe LE MAGUERESSE',
    role: 'Membre',
    photo: 'conseil-christophe-le-magueresse.jpg',
  },
]

/**
 * Animateurs publish their mobile number so randonneurs can reach them about a
 * sortie; it is shown as text on the card and doubles as a tel: link.
 */
export const animationTeam: StaticTeamMember[] = [
  {
    name: 'Isabelle ANDERLINI',
    description: '06 84 62 62 52',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0684626252' }],
    photo: 'animation-isabelle-anderlini.jpg',
  },
  {
    name: 'Bernard ATTENOT',
    description: '07 71 93 28 04',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0771932804' }],
    photo: 'animation-bernard-attenot.jpg',
  },
  {
    name: 'Daniel BERTEAUX',
    description: '06 86 07 99 09',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0686079909' }],
    photo: 'animation-daniel-berteaux.png',
  },
  {
    name: 'Pascal BRET',
    description: '07 88 26 43 84',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0788264384' }],
    photo: 'animation-pascal-bret.jpg',
  },
  {
    name: 'Daniel DETHOREY',
    description: '06 85 86 40 10',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0685864010' }],
    photo: 'animation-daniel-dethorey.jpg',
  },
  {
    name: 'Roland FERRARI',
    description: '06 61 15 47 03',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0661154703' }],
    photo: 'animation-roland-ferrari.jpg',
  },
  {
    name: 'Roger FRANÇOIS',
    description: '06 84 36 42 72',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0684364272' }],
    photo: 'animation-roger-francois.jpg',
  },
  {
    name: 'Pierre LAURENT',
    description: '06 10 53 87 81',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0610538781' }],
    photo: 'animation-pierre-laurent.jpg',
  },
  {
    name: 'Jean-Marie MAZELIN',
    description: '07 81 11 20 47',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0781112047' }],
    photo: 'animation-jean-marie-mazelin.jpg',
  },
  {
    name: 'Patricia MORELE',
    description: '06 73 97 19 14',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0673971914' }],
    photo: 'animation-patricia-morele.png',
  },
  {
    name: 'Philippe NEUVILLERS',
    description: '06 72 77 32 84',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0672773284' }],
    photo: 'animation-philippe-neuvillers.jpg',
  },
  {
    name: 'Michel PASQUET',
    description: '06 12 27 67 10',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0612276710' }],
    photo: 'animation-michel-pasquet.png',
  },
  {
    name: 'Dany ROCHEFOLLE',
    description: '06 86 18 43 89',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0686184389' }],
    photo: 'animation-dany-rochefolle.jpg',
  },
  {
    name: 'Suzanne ROCHEFOLLE',
    description: '06 89 34 78 32',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0689347832' }],
    photo: 'animation-suzanne-rochefolle.jpg',
  },
  {
    name: 'Gérald SABOT',
    description: '06 07 23 21 83',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0607232183' }],
    photo: 'animation-gerald-sabot.jpg',
  },
  {
    name: 'Francis SPECTE',
    description: '06 75 73 51 73',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0675735173' }],
    photo: 'animation-francis-specte.jpg',
  },
  {
    name: 'Jean-luc STEPHAN',
    description: '06 75 08 61 69',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0675086169' }],
    photo: 'animation-jean-luc-stephan.jpg',
  },
  {
    name: 'Muriel TARAL',
    description: '06 78 64 07 73',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0678640773' }],
    photo: 'animation-muriel-taral.png',
  },
  {
    name: 'Bernard TUAILLON',
    description: '06 21 77 17 85',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0621771785' }],
    photo: 'animation-bernard-tuaillon.png',
  },
]
