import type { TeamMember } from '@/components/TeamSection/TeamSection'

/**
 * A member as written down here: what `TeamSection` renders, except the portrait
 * is referenced by media filename rather than by id. Ids are per-database
 * sequences, so the pages resolve the filename at render time.
 */
export type StaticTeamMember = Omit<TeamMember, 'media'> & { photo?: string }

/**
 * Team listings kept in code, pending the `adherents` collection that will hold
 * the club's roster and let these pages query it instead. Portraits come from
 * scripts/import-team-photos.ts, which keys each file on the member's full name.
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
 * sortie. The number is stored the way it should read on the card — the card
 * shows it next to the phone icon and strips the spaces for the tel: link.
 */
export const animationTeam: StaticTeamMember[] = [
  {
    name: 'Isabelle ANDERLINI',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 84 62 62 52' }],
    photo: 'animation-isabelle-anderlini.jpg',
  },
  {
    name: 'Bernard ATTENOT',
    contactLinks: [{ id: 'phone', type: 'phone', value: '07 71 93 28 04' }],
    photo: 'animation-bernard-attenot.jpg',
  },
  {
    name: 'Daniel BERTEAUX',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 86 07 99 09' }],
    photo: 'animation-daniel-berteaux.png',
  },
  {
    name: 'Pascal BRET',
    contactLinks: [{ id: 'phone', type: 'phone', value: '07 88 26 43 84' }],
    photo: 'animation-pascal-bret.jpg',
  },
  {
    name: 'Daniel DETHOREY',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 85 86 40 10' }],
    photo: 'animation-daniel-dethorey.jpg',
  },
  {
    name: 'Roland FERRARI',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 61 15 47 03' }],
    photo: 'animation-roland-ferrari.jpg',
  },
  {
    name: 'Roger FRANÇOIS',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 84 36 42 72' }],
    photo: 'animation-roger-francois.jpg',
  },
  {
    name: 'Pierre LAURENT',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 10 53 87 81' }],
    photo: 'animation-pierre-laurent.jpg',
  },
  {
    name: 'Jean-Marie MAZELIN',
    contactLinks: [{ id: 'phone', type: 'phone', value: '07 81 11 20 47' }],
    photo: 'animation-jean-marie-mazelin.jpg',
  },
  {
    name: 'Patricia MORELE',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 73 97 19 14' }],
    photo: 'animation-patricia-morele.png',
  },
  {
    name: 'Philippe NEUVILLERS',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 72 77 32 84' }],
    photo: 'animation-philippe-neuvillers.jpg',
  },
  {
    name: 'Michel PASQUET',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 12 27 67 10' }],
    photo: 'animation-michel-pasquet.png',
  },
  {
    name: 'Dany ROCHEFOLLE',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 86 18 43 89' }],
    photo: 'animation-dany-rochefolle.jpg',
  },
  {
    name: 'Suzanne ROCHEFOLLE',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 89 34 78 32' }],
    photo: 'animation-suzanne-rochefolle.jpg',
  },
  {
    name: 'Gérald SABOT',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 07 23 21 83' }],
    photo: 'animation-gerald-sabot.jpg',
  },
  {
    name: 'Francis SPECTE',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 75 73 51 73' }],
    photo: 'animation-francis-specte.jpg',
  },
  {
    name: 'Jean-luc STEPHAN',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 75 08 61 69' }],
    photo: 'animation-jean-luc-stephan.jpg',
  },
  {
    name: 'Muriel TARAL',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 78 64 07 73' }],
    photo: 'animation-muriel-taral.png',
  },
  {
    name: 'Bernard TUAILLON',
    contactLinks: [{ id: 'phone', type: 'phone', value: '06 21 77 17 85' }],
    photo: 'animation-bernard-tuaillon.png',
  },
]
