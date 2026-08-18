import type { TeamMember } from '@/components/TeamSection/TeamSection'

/**
 * Team listings kept in code so the pages can ship before the `teamDirectory`
 * entries exist in the CMS. The shape mirrors that global's `teamMembers` field,
 * so the arrays can be seeded as-is and this file deleted once the association
 * manages the lists from the admin, photos included.
 */
export const boardMembers: TeamMember[] = [
  { name: 'Pascal BRET', role: 'Président' },
  { name: 'Suzanne ROCHEFOLLE', role: 'Vice Présidente' },
  { name: 'Isabelle ANDERLINI', role: 'Secrétaire' },
  { name: 'Alain GAUDE', role: 'Trésorier' },
  { name: 'Daniel BERTEAUX', role: 'Référent Santé' },
  { name: 'Jean-Marie MAZELIN', role: 'Référent Voyages' },
  { name: 'Muriel TARAL', role: 'Référente Animations' },
  { name: 'Anne-Marie OUELDENNAOUA', role: 'Secrétaire adjointe' },
  { name: 'Abdelatif OUELDENNAOUA', role: 'Membre' },
  { name: 'Pascal MELIN', role: 'Membre' },
  { name: 'Philippe NEUVILLERS', role: 'Membre' },
  { name: 'Denis CHATELAIN', role: 'Membre' },
  { name: 'Daniel ROCHEFOLLE', role: 'Membre' },
  { name: 'Pierre REVEST', role: 'Membre' },
  { name: 'Christophe LE MAGUERESSE', role: 'Membre' },
]

/**
 * Animateurs publish their mobile number so randonneurs can reach them about a
 * sortie; it is shown as text on the card and doubles as a tel: link.
 */
export const animationTeam: TeamMember[] = [
  {
    name: 'Isabelle ANDERLINI',
    description: '06 84 62 62 52',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0684626252' }],
  },
  {
    name: 'Bernard ATTENOT',
    description: '07 71 93 28 04',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0771932804' }],
  },
  {
    name: 'Daniel BERTEAUX',
    description: '06 86 07 99 09',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0686079909' }],
  },
  {
    name: 'Pascal BRET',
    description: '07 88 26 43 84',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0788264384' }],
  },
  {
    name: 'Daniel DETHOREY',
    description: '06 85 86 40 10',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0685864010' }],
  },
  {
    name: 'Roland FERRARI',
    description: '06 61 15 47 03',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0661154703' }],
  },
  {
    name: 'Roger FRANÇOIS',
    description: '06 84 36 42 72',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0684364272' }],
  },
  {
    name: 'Pierre LAURENT',
    description: '06 10 53 87 81',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0610538781' }],
  },
  {
    name: 'Jean-Marie MAZELIN',
    description: '07 81 11 20 47',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0781112047' }],
  },
  {
    name: 'Patricia MORELE',
    description: '06 73 97 19 14',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0673971914' }],
  },
  {
    name: 'Philippe NEUVILLERS',
    description: '06 72 77 32 84',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0672773284' }],
  },
  {
    name: 'Michel PASQUET',
    description: '06 12 27 67 10',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0612276710' }],
  },
  {
    name: 'Dany ROCHEFOLLE',
    description: '06 86 18 43 89',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0686184389' }],
  },
  {
    name: 'Suzanne ROCHEFOLLE',
    description: '06 89 34 78 32',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0689347832' }],
  },
  {
    name: 'Gérald SABOT',
    description: '06 07 23 21 83',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0607232183' }],
  },
  {
    name: 'Francis SPECTE',
    description: '06 75 73 51 73',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0675735173' }],
  },
  {
    name: 'Jean-luc STEPHAN',
    description: '06 75 08 61 69',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0675086169' }],
  },
  {
    name: 'Muriel TARAL',
    description: '06 78 64 07 73',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0678640773' }],
  },
  {
    name: 'Bernard TUAILLON',
    description: '06 21 77 17 85',
    contactLinks: [{ id: 'phone', type: 'phone', value: '0621771785' }],
  },
]
