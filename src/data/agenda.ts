import type { AgendaOuting } from '@/components/home/agenda/groupOutings'

/**
 * The club's programme for the coming weeks, kept in code so the agenda can
 * ship before the `events` collection grows a date field. Same shape the CMS
 * query will return, so only the source changes later — see
 * src/components/home/agenda/groupOutings.ts.
 *
 * Transcribed from the current site's agenda modules (August and September
 * 2026). The animateur is lifted out of the free text into `author`, the
 * "km : 0,0" and "D+ : --- m" placeholders are dropped, and everything else is
 * left as the club wrote it.
 */
export const agendaOutings: AgendaOuting[] = [
  {
    title: 'Journée',
    date: '2026-08-20',
    startTime: '08:30',
    endTime: '11:45',
    author: 'Jean-Luc',
    content: `BOUCQ (terrain de foot)
Lieu de départ : https://maps.app.goo.gl/1fhbP7SyeCEiAhLe8`,
  },
  {
    title: 'Petite',
    date: '2026-08-20',
    startTime: '09:00',
    endTime: '11:30',
    author: 'Philippe',
    content: `VILLEY LE SEC (Eglise)
Lieu de départ : https://maps.app.goo.gl/QcBphyhyqeEdQPNK7`,
  },
  {
    title: 'Nordique',
    date: '2026-08-21',
    startTime: '09:00',
    endTime: '11:30',
    author: 'Bernard T.',
    content: `BLENOD LES TOUL (Mairie)
km : 10,0 · D+ : 125 m
Lieu de départ : https://maps.app.goo.gl/KoNog92s8WDwxqp86`,
  },
  {
    title: 'Douce',
    date: '2026-08-21',
    startTime: '09:30',
    endTime: '11:45',
    author: 'Daniel D.',
    content: `OCHEY (chalet Forestier)
Lieu de départ : https://maps.app.goo.gl/revUbkPxsxVSKFBL9`,
  },
  {
    title: 'Petite',
    date: '2026-08-24',
    startTime: '09:00',
    endTime: '11:30',
    author: 'Pascal',
    content: `LAY SAINT REMY (Eglise)
Lieu de départ : https://maps.app.goo.gl/KSVoXskUNfSYBd6H6`,
  },
  {
    title: 'Journée',
    date: '2026-08-24',
    startTime: '09:00',
    endTime: '17:00',
    author: 'Doudou',
    content: `NEUFCHATEAU (parking mairie de Rollainville)
covoiturage Carrefour à 08:00
Lieu de départ : https://maps.app.goo.gl/6Vba3XtW7jC1KSCP6`,
  },
  {
    title: 'Santé',
    date: '2026-08-25',
    startTime: '09:30',
    endTime: '11:45',
    author: 'Jean-Luc',
    content: `CHOLOY (Mairie)
Lieu de départ : https://maps.app.goo.gl/qVfvfH5RgCxP7rFd9`,
  },
  {
    title: 'Grande',
    date: '2026-08-27',
    startTime: '08:30',
    endTime: '11:45',
    author: 'Pascal',
    content: `FONTENOY (Gare)
Lieu de départ : https://maps.app.goo.gl/DhpHM9EfDuTZYYCf9`,
  },
  {
    title: 'Petite',
    date: '2026-08-27',
    startTime: '09:00',
    endTime: '11:45',
    author: 'Roland',
    content: `MARON (ancienne Gare)
Lieu de départ : https://maps.app.goo.gl/GfZmAzk4mPksRHFr5`,
  },
  {
    title: 'Nordique',
    date: '2026-08-28',
    startTime: '09:00',
    endTime: '11:30',
    author: 'Bernard T.',
    content: `BOUCQ (terrain de foot)
km : 9,0 · D+ : 130 m
Lieu de départ : https://maps.app.goo.gl/a6KpaC6TdebhWHj37`,
  },
  {
    title: 'Douce',
    date: '2026-08-28',
    startTime: '09:30',
    endTime: '11:45',
    author: 'Gérald',
    content: `ECROUVES (plateau)
Lieu de départ : https://maps.app.goo.gl/QZfCj7EsVr3DbDWX7`,
  },
  {
    title: 'Grande',
    date: '2026-08-31',
    startTime: '08:30',
    endTime: '11:45',
    author: 'Pascal',
    content: `MARON (ancienne gare)
Lieu de départ : https://maps.app.goo.gl/GfZmAzk4mPksRHFr5`,
  },
  {
    title: 'Petite',
    date: '2026-08-31',
    startTime: '09:00',
    endTime: '11:30',
    author: 'Philippe',
    content: `MONT LE VIGNOBLE (Cimetière)
Lieu de départ : https://maps.app.goo.gl/Z3oCqtaGHi96VBfj7`,
  },
  {
    title: 'Santé',
    date: '2026-09-01',
    startTime: '14:00',
    endTime: '16:15',
    author: 'Muriel',
    content: `VILLEY LE SEC (Mairie)
Lieu de départ : https://maps.app.goo.gl/ozneCFqQ6tULcxie6`,
  },
  {
    title: 'Petite',
    date: '2026-09-03',
    startTime: '09:00',
    endTime: '11:30',
    author: 'Jean-Luc',
    content: `PAGNY SUR MEUSE (Gare)
Lieu de départ : https://maps.app.goo.gl/NypUgPHzgVaPjkZ6A`,
  },
  {
    title: 'Grande',
    date: '2026-09-03',
    startTime: '14:00',
    endTime: '17:30',
    author: 'Francis',
    content: `SAULXURES LES VANNES (Parking Eglise)
km : 13,0 · D+ : 220 m
Covoiturage Intermarché-Ex Colruyt à 13 h 30
Lieu de départ : https://maps.app.goo.gl/9yj7guonroVDfeht5`,
  },
  {
    title: 'Nordique',
    date: '2026-09-04',
    startTime: '09:00',
    endTime: '11:30',
    author: 'Bernard T.',
    content: `TROUSSEY (Eglise)
Lieu de départ : https://maps.app.goo.gl/8ztt1UzDYj7zZhSZ7`,
  },
  {
    title: 'Douce',
    date: '2026-09-04',
    startTime: '14:00',
    endTime: '16:15',
    author: 'Gérald',
    content: `VELAINE EN HAYE (terrain de foot)
Lieu de départ : https://maps.app.goo.gl/SUdCrjVEMrS6wsbV9`,
  },
  {
    title: 'Petite',
    date: '2026-09-07',
    startTime: '09:00',
    endTime: '11:30',
    author: 'Michel',
    content: `CHOLOY (Mairie)
km : 9,0 · D+ : 92 m
Lieu de départ : https://maps.app.goo.gl/QdX8pKM3GpWcEsW39`,
  },
  {
    title: 'Grande',
    date: '2026-09-07',
    startTime: '14:00',
    endTime: '16:45',
    author: 'Bernard A.',
    content: `MANONVILLE (Cimetière)
covoiturage LIDL CDM 13H30
Lieu de départ : https://maps.app.goo.gl/Sopa4FDGNnHwyFp26`,
  },
  {
    title: 'Santé',
    date: '2026-09-08',
    startTime: '09:30',
    endTime: '11:30',
    author: 'Pascal',
    content: `BRULEY (Kiosque)
Lieu de départ : https://maps.app.goo.gl/sgBgTD29jGCYCS3H6`,
  },
  {
    title: 'Petite',
    date: '2026-09-10',
    startTime: '09:00',
    endTime: '11:30',
    author: 'Pascal',
    content: `TOUL (Pont Bernon)
Lieu de départ : https://maps.app.goo.gl/qYmF5YiwDgbdBMUU8`,
  },
  {
    title: 'Grande',
    date: '2026-09-10',
    startTime: '14:00',
    endTime: '17:00',
    author: 'Philippe',
    content: `CHAUDENEY (salle Bouchot)
Lieu de départ : https://maps.app.goo.gl/71tdjgm7k3xUirq67`,
  },
  {
    title: 'Nordique',
    date: '2026-09-11',
    startTime: '09:00',
    endTime: '11:30',
    author: 'Bernard A.',
    content: `BRULEY (Eglise)
Lieu de départ : https://maps.app.goo.gl/qgyStRRaTeFt1yzm7`,
  },
  {
    title: 'Douce',
    date: '2026-09-11',
    startTime: '14:00',
    endTime: '16:15',
    author: 'Daniel D',
    content: `GYE (Mairie)
Lieu de départ : https://maps.app.goo.gl/rcQs37rafDektJsU8`,
  },
  {
    title: 'Moyenne',
    date: '2026-09-14',
    startTime: '14:00',
    endTime: '16:45',
    author: 'Pascal',
    content: `BLENOD LES TOUL (point de vue)
km : 11,1 · D+ : 137 m
Lieu de départ : https://maps.app.goo.gl/6MBhYX6YZTJ5Bzdh7`,
  },
  {
    title: 'Santé (sortie journée)',
    date: '2026-09-15',
    startTime: '14:00',
    endTime: '16:15',
    author: 'Patricia',
    content: `LAC DU DER
covoiturage Intermarché contact (ancien Colryut) à 08H30
Lieu de départ : https://maps.app.goo.gl/LPGGQCMisGgfZMdC6`,
  },
  {
    title: 'Petite',
    date: '2026-09-17',
    startTime: '14:00',
    endTime: '16:30',
    author: 'Philippe',
    content: `VILLEY SAINT ETIENNE (Pavillon Bleu)
Lieu de départ : https://maps.app.goo.gl/LeMmcYaHHBsLDES19`,
  },
  {
    title: 'Grande',
    date: '2026-09-17',
    startTime: '14:00',
    endTime: '17:00',
    author: 'Jean Luc',
    content: `VITERNE (Stade de foot)
Lieu de départ : https://maps.app.goo.gl/oAgVZGdxLtnjHKSx5`,
  },
  {
    title: 'Nordique',
    date: '2026-09-18',
    startTime: '09:00',
    endTime: '11:30',
    author: 'Bernard A.',
    content: `FONTENOY (Gare)
Lieu de départ : https://maps.app.goo.gl/PYhY5ZvCXCW3LJLy7`,
  },
  {
    title: 'Marche Breathwalk',
    date: '2026-09-18',
    startTime: '10:00',
    endTime: '12:00',
    author: 'Danièle (Subtil)',
    content: `ETANGS DE CHAUDENEY (Parking Kayak)
Sur inscription uniquement (voir site)
Lieu de départ : https://maps.app.goo.gl/CDz5yrdS3S86NteW6`,
  },
  {
    title: 'Journée interclubs santé',
    date: '2026-09-19',
    startTime: '09:00',
    endTime: '18:00',
    author: 'Jean-Luc (CD54)',
    content: `SAINT-MAX (Chateau)
Inscription obligatoire
https://forms.gle/7c5QjegnhgkJ57uL8
Départ bus à 08H20 (Arsenal)`,
  },
  {
    title: 'Sortie journée',
    date: '2026-09-20',
    startTime: '10:00',
    endTime: '17:30',
    author: 'Isabelle',
    content: `LAY SAINT CHRISTOPHE (Salle des fêtes Pierre Rotach)
Lieu de départ : https://maps.app.goo.gl/2YcR59dUFnkLfTvKA`,
  },
  {
    title: 'Petite',
    date: '2026-09-21',
    startTime: '14:00',
    endTime: '16:30',
    author: 'Isabelle',
    content: `PIERRE LA TREICHE (Salle Poussot)
Lieu de départ : https://maps.app.goo.gl/xEXPpprNPWQZcvZb7`,
  },
  {
    title: 'Grande',
    date: '2026-09-21',
    startTime: '14:00',
    endTime: '16:45',
    author: 'Doudou',
    content: `CLAIRLIEU (parking carrefour de la haute borne avant Clairlieu)
Lieu de départ : https://maps.app.goo.gl/Hyx8vqnsEd21sbpF7`,
  },
  {
    title: 'Santé',
    date: '2026-09-22',
    startTime: '14:00',
    endTime: '16:15',
    author: 'Pascal',
    content: `TOUL CROIX DE METZ (Toul Padel Club)
Lieu de départ : https://maps.app.goo.gl/fgBaLmbVNHgsAavKA`,
  },
  {
    title: 'Petite',
    date: '2026-09-24',
    startTime: '14:00',
    endTime: '16:30',
    author: 'Michel',
    content: `THUILLEY AUX GROSEILLES (parking salle des fêtes)
km : 10,0 · D+ : 142 m
Lieu de départ : https://maps.app.goo.gl/zU3byfDrwFhZRr4H7`,
  },
  {
    title: 'Journée',
    date: '2026-09-24',
    startTime: '14:00',
    endTime: '17:00',
    author: 'Jean-Marie',
    content: `LE BONHOMME - LE GRAND BREZOUARD
covoiturage Carrefour à 07H30
Lieu de départ : https://maps.app.goo.gl/GPiBYzMQ5NohHrmq7`,
  },
  {
    title: 'Nordique',
    date: '2026-09-25',
    startTime: '09:00',
    endTime: '11:30',
    author: 'Bernard A.',
    content: `CHAUDENEY (salle Bouchot)
Lieu de départ : https://maps.app.goo.gl/6vPvjX62FVQL7Dbs8`,
  },
  {
    title: 'Douce',
    date: '2026-09-25',
    startTime: '14:00',
    endTime: '16:15',
    author: 'Daniel D',
    content: `ALLAIN (aire de covoiturage)
Lieu de départ : https://maps.app.goo.gl/iis7L8j5rWrVBRqd8`,
  },
  {
    title: 'Petite',
    date: '2026-09-28',
    startTime: '14:00',
    endTime: '16:30',
    author: 'Gérald',
    content: `CORNIEVILLE (parking milieu du village)
Lieu de départ : https://maps.app.goo.gl/a9reeTAKWGZZfHJw8`,
  },
  {
    title: 'Grande',
    date: '2026-09-28',
    startTime: '14:00',
    endTime: '16:45',
    author: 'Jean-Marie',
    content: `PAGNEY DERRIERE BARINE (Les Acacias)
Lieu de départ : https://maps.app.goo.gl/nK3aknincArtnstTA`,
  },
  {
    title: 'Santé',
    date: '2026-09-29',
    startTime: '14:00',
    endTime: '16:15',
    author: 'Muriel',
    content: `BICQUELEY (Rue de la Poirière, tas de bois)
Lieu de départ : https://maps.app.goo.gl/Xja52hs2whEg68NQA`,
  },
]
