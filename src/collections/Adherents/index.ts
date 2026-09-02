import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { adminOnlyFieldAccess } from '@/access/adminOnlyFieldAccess'
import { adminOrLinkedUser } from '@/access/adminOrLinkedUser'

import { normaliseLicence, validateLicence } from './licence'
import { fillFullName } from './hooks/fillFullName'

/**
 * Everyone the club knows: the adhérents, which includes the conseil
 * d'administration and the animateurs rather than listing them apart.
 *
 * Deliberately *not* the `users` collection, though it was the obvious place to
 * look. Two facts about the club's own list decide it. Its 276 rows share only
 * 233 e-mail addresses — 28 addresses cover 60 people, households answering on
 * one mailbox — and 11 people have none at all, while a Payload auth collection
 * needs one unique address per document; a fifth of the roster simply cannot be
 * represented as distinct users. And the median age is 71, so the club will not
 * be trading its sheet for a login page any time soon. `users` stays what it is
 * — credentials and the ecommerce customer — and points here through `user`.
 *
 * Which also settles where a member's own details live: here, not there. No
 * field is stored in both collections, so a member editing their telephone in
 * the espace adhérent edits this document directly and there is nothing to keep
 * in step. The single deliberate overlap is `email`, because logging in needs an
 * address and the FFRandonnée needs one to write to; a change to the login
 * address propagates here rather than the reverse.
 *
 * Read access is closed even though three pages publish parts of it. /board,
 * /animation-team and /trombinoscope are prerendered, so they read through the
 * Local API with `overrideAccess` and an explicit `select` and the data leaves
 * the server as HTML. Opening collection read instead would expose
 * `/api/adherents` — and with it the names of the people who have *not* agreed
 * to appear, which is exactly the list that must not be enumerable.
 */
export const Adherents: CollectionConfig<'adherents'> = {
  slug: 'adherents',
  labels: {
    singular: 'Adhérent',
    plural: 'Adhérents',
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOrLinkedUser,
    update: adminOrLinkedUser,
  },
  admin: {
    defaultColumns: ['fullName', 'status', 'licence', 'updatedAt'],
    group: 'Utilisateurs',
    // The derived name holds both halves, but the secretary looking for a
    // licence number or a first name should find the row by typing either.
    listSearchableFields: ['fullName', 'lastName', 'firstName', 'licence'],
    useAsTitle: 'fullName',
  },
  defaultSort: 'fullName',
  fields: [
    /**
     * Where the roster stands for this person, said outright rather than
     * inferred from which columns happen to be filled.
     *
     * The club's sheet answers "is this a current member?" three different ways
     * — a `Pointé` tick, a payment date, an FFR amount — and on the day it was
     * exported they disagreed by 190 people, because a season opens on 1
     * September and renewals arrive through the autumn. A member is not lapsed
     * because the secretary has not reached them yet, so the two states are
     * separate here.
     */
    {
      name: 'status',
      type: 'select',
      index: true,
      label: 'Situation',
      access: {
        create: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      admin: {
        position: 'sidebar',
      },
      defaultValue: 'prospect',
      options: [
        { label: 'À l’essai', value: 'prospect' },
        { label: 'Renouvellement attendu', value: 'pending' },
        { label: 'À jour', value: 'active' },
        { label: 'Non renouvelé', value: 'lapsed' },
        { label: 'Ancien adhérent', value: 'former' },
      ],
      required: true,
    },
    /**
     * The account, when there is one. Optional and unique: most of the roster
     * has none, and no account belongs to two people.
     */
    {
      name: 'user',
      type: 'relationship',
      label: 'Compte',
      relationTo: 'users',
      unique: true,
      access: {
        create: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      admin: {
        description: 'Renseigné lorsque l’adhérent crée un compte sur le site.',
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'civility',
                  type: 'select',
                  label: 'Civilité',
                  access: {
                    create: adminOnlyFieldAccess,
                    update: adminOnlyFieldAccess,
                  },
                  admin: { width: '20%' },
                  options: [
                    { label: 'Mme', value: 'mme' },
                    { label: 'Mr', value: 'mr' },
                  ],
                },
                {
                  name: 'lastName',
                  type: 'text',
                  index: true,
                  label: 'Nom',
                  access: {
                    create: adminOnlyFieldAccess,
                    update: adminOnlyFieldAccess,
                  },
                  admin: { width: '40%' },
                  required: true,
                },
                {
                  name: 'firstName',
                  type: 'text',
                  label: 'Prénom',
                  access: {
                    create: adminOnlyFieldAccess,
                    update: adminOnlyFieldAccess,
                  },
                  admin: { width: '40%' },
                },
              ],
            },
            /**
             * Derived by `fillFullName`, never typed. Hidden rather than
             * read-only, for the reason `Locations.title` is: a greyed-out box
             * repeating the two fields above it is a question the editor has to
             * answer for no gain.
             */
            {
              name: 'fullName',
              type: 'text',
              index: true,
              admin: {
                hidden: true,
              },
            },
            {
              name: 'birthDate',
              type: 'date',
              label: 'Date de naissance',
              access: {
                create: adminOnlyFieldAccess,
                update: adminOnlyFieldAccess,
              },
              admin: {
                // Age is not stored: the sheet's column is a formula over this
                // date, and a stored copy would be wrong by the next birthday.
                description: 'L’âge n’est pas conservé, il se déduit de cette date.',
                date: { displayFormat: 'dd/MM/yyyy', pickerAppearance: 'dayOnly' },
              },
            },
            /**
             * Family membership, as the sheet's `Rattaché(e)` column records it:
             * one adhérent pointing at the one whose adhesion covers them.
             */
            {
              name: 'household',
              type: 'relationship',
              label: 'Rattaché(e) à',
              relationTo: 'adherents',
              access: {
                create: adminOnlyFieldAccess,
                update: adminOnlyFieldAccess,
              },
            },
          ],
          label: 'Identité',
        },
        {
          description:
            'Coordonnées privées. Rien n’est publié sur le site sans une autorisation cochée dans l’onglet « Publication ».',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'email',
                  type: 'email',
                  label: 'E-mail',
                  admin: {
                    description:
                      'Peut être partagé avec un conjoint : 28 adresses couvrent 60 adhérents.',
                    width: '50%',
                  },
                },
                {
                  name: 'phone',
                  type: 'text',
                  label: 'Téléphone',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'streetNumber',
                  type: 'text',
                  label: 'N°',
                  admin: { width: '15%' },
                },
                {
                  name: 'address',
                  type: 'text',
                  label: 'Adresse',
                  admin: { width: '85%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'postalCode',
                  type: 'text',
                  label: 'Code postal',
                  admin: { width: '30%' },
                },
                {
                  name: 'city',
                  type: 'text',
                  label: 'Ville',
                  admin: { width: '70%' },
                },
              ],
            },
          ],
          label: 'Coordonnées',
        },
        {
          description:
            'Ce que le site peut montrer de cet adhérent. Tout est décoché par défaut : une case non cochée ne paraît nulle part.',
          fields: [
            {
              name: 'photo',
              type: 'upload',
              label: 'Portrait',
              relationTo: 'media',
            },
            /**
             * Three permissions rather than one, because they are asked and
             * withdrawn separately: an animateur publishes a mobile number so
             * randonneurs can reach them about a sortie, which says nothing
             * about whether their face belongs on the trombinoscope.
             *
             * All three default to false, which means every page that reads this
             * collection returns nobody until permissions are collected. That is
             * the intended starting point: the pages keep their lists in
             * `src/data` until each one's consents are in, and move over then.
             */
            {
              name: 'publicationConsent',
              type: 'group',
              label: 'Publication sur le site',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'photo',
                      type: 'checkbox',
                      label: 'Portrait',
                      defaultValue: false,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'phone',
                      type: 'checkbox',
                      label: 'Téléphone',
                      defaultValue: false,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'email',
                      type: 'checkbox',
                      label: 'E-mail',
                      defaultValue: false,
                      admin: { width: '33%' },
                    },
                  ],
                },
              ],
            },
          ],
          label: 'Publication',
        },
        {
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'licence',
                  type: 'text',
                  label: 'N° de licence',
                  unique: true,
                  access: {
                    create: adminOnlyFieldAccess,
                    update: adminOnlyFieldAccess,
                  },
                  admin: {
                    description: 'Sept chiffres et une lettre, par exemple 0947011C.',
                    placeholder: '0947011C',
                    width: '50%',
                  },
                  hooks: {
                    beforeValidate: [({ value }) => normaliseLicence(value)],
                  },
                  validate: validateLicence,
                },
                /**
                 * Not every adhérent holds their licence here: 26 of the club's
                 * 276 are licensed at another club and walk with this one.
                 */
                {
                  name: 'licenceClub',
                  type: 'text',
                  label: 'Club de la licence',
                  access: {
                    create: adminOnlyFieldAccess,
                    update: adminOnlyFieldAccess,
                  },
                  admin: {
                    description: 'Si la licence est prise dans un autre club.',
                    placeholder: 'Rando Toul',
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'medicalCertificateDate',
              type: 'date',
              label: 'Certificat médical',
              access: {
                create: adminOnlyFieldAccess,
                update: adminOnlyFieldAccess,
              },
              admin: {
                date: { displayFormat: 'dd/MM/yyyy', pickerAppearance: 'dayOnly' },
                description: 'La date du certificat, pas son contenu.',
              },
            },
            /**
             * What puts a person on /board and /animation-team. A `boardRole`
             * that is set is what makes someone a member of the conseil — there
             * is no separate tick — and `boardRank` is the order the club reads
             * itself in, which is neither alphabetical nor by seniority.
             */
            {
              type: 'row',
              fields: [
                {
                  name: 'boardRole',
                  type: 'text',
                  label: 'Fonction au conseil',
                  access: {
                    create: adminOnlyFieldAccess,
                    update: adminOnlyFieldAccess,
                  },
                  admin: {
                    description: 'Renseigner cette fonction place l’adhérent au conseil.',
                    placeholder: 'Trésorier',
                    width: '60%',
                  },
                },
                {
                  name: 'boardRank',
                  type: 'number',
                  label: 'Rang',
                  access: {
                    create: adminOnlyFieldAccess,
                    update: adminOnlyFieldAccess,
                  },
                  admin: {
                    description: 'Ordre d’affichage sur la page du conseil.',
                    width: '40%',
                  },
                },
              ],
            },
            {
              name: 'isAnimateur',
              type: 'checkbox',
              index: true,
              label: 'Animateur ou animatrice',
              access: {
                create: adminOnlyFieldAccess,
                update: adminOnlyFieldAccess,
              },
              defaultValue: false,
            },
          ],
          label: 'Club',
        },
        {
          fields: [
            /**
             * One row per season, rather than a set of columns overwritten each
             * September. The sheet carries a single season and loses the last
             * one every time it is renewed; this keeps the history the club
             * currently throws away, and answers "was this person a member in
             * 2024?" without an archive of spreadsheets.
             */
            {
              name: 'adhesions',
              type: 'array',
              label: 'Adhésions',
              labels: {
                singular: 'Saison',
                plural: 'Saisons',
              },
              access: {
                create: adminOnlyFieldAccess,
                read: adminOnlyFieldAccess,
                update: adminOnlyFieldAccess,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'season',
                      type: 'text',
                      label: 'Saison',
                      admin: { placeholder: '2026/2027', width: '25%' },
                      required: true,
                    },
                    {
                      name: 'paidOn',
                      type: 'date',
                      label: 'Payé le',
                      admin: {
                        date: { displayFormat: 'dd/MM/yyyy', pickerAppearance: 'dayOnly' },
                        width: '25%',
                      },
                    },
                    {
                      name: 'amountFfr',
                      type: 'number',
                      label: 'Part FFR (€)',
                      admin: { width: '25%' },
                    },
                    {
                      name: 'amountClub',
                      type: 'number',
                      label: 'Part club (€)',
                      admin: { width: '25%' },
                    },
                  ],
                },
                {
                  name: 'note',
                  type: 'text',
                  label: 'Note',
                },
              ],
            },
            /**
             * Where the sheet's marginalia lands. Its `Date édition` and `Club
             * coût` columns are dropped, but nine rows carry « A vérifier » or
             * « A SUIVRE » in the first and twenty-one carry amounts in the
             * second that reconcile with nothing else — all of it written by
             * hand about people who have paid, so it is preserved as text here
             * rather than discarded with the columns.
             */
            {
              name: 'notes',
              type: 'textarea',
              label: 'Notes internes',
              access: {
                create: adminOnlyFieldAccess,
                read: adminOnlyFieldAccess,
                update: adminOnlyFieldAccess,
              },
            },
          ],
          label: 'Suivi',
        },
      ],
    },
  ],
  hooks: {
    beforeValidate: [fillFullName],
  },
  timestamps: true,
}
