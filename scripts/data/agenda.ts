/**
 * One event exactly as the club printed it, with the details still as plain
 * text: one item per line, bare URLs and all.
 */
export type SeedEvent = {
  title: string
  /** `YYYY-MM-DD`, read as a day in Toul. */
  date: string
  startTime?: string
  endTime?: string
  content: string
}

/**
 * Seed input for scripts/import-agenda.ts: the club's programme for August and
 * September 2026, transcribed from the current site's agenda modules.
 *
 * This is not what the site renders — the agenda reads the `events` collection.
 * The script turns each line of `content` into a paragraph and each bare URL into
 * a link, so the same text arrives in the CMS as rich text an editor can rework.
 *
 * The "km : 0,0" and "D+ : --- m" placeholders are dropped; everything else,
 * animateur included, is left as the club wrote it.
 */
export const agendaEvents: SeedEvent[] = [
  {
    title: 'Journée',
    date: '2026-08-20',
    startTime: '08:30',
    endTime: '11:45',
    content: `BOUCQ (terrain de foot)
Animateur : Jean-Luc
Lieu de départ : https://maps.app.goo.gl/1fhbP7SyeCEiAhLe8`,
  },
  {
    title: 'Petite',
    date: '2026-08-20',
    startTime: '09:00',
    endTime: '11:30',
    content: `VILLEY LE SEC (Eglise)
Animateur : Philippe
Lieu de départ : https://maps.app.goo.gl/QcBphyhyqeEdQPNK7`,
  },
  {
    title: 'Nordique',
    date: '2026-08-21',
    startTime: '09:00',
    endTime: '11:30',
    content: `BLENOD LES TOUL (Mairie)
Animateur : Bernard T.
km : 10,0 · D+ : 125 m
Lieu de départ : https://maps.app.goo.gl/KoNog92s8WDwxqp86`,
  },
  {
    title: 'Douce',
    date: '2026-08-21',
    startTime: '09:30',
    endTime: '11:45',
    content: `OCHEY (chalet Forestier)
Animateur : Daniel D.
Lieu de départ : https://maps.app.goo.gl/revUbkPxsxVSKFBL9`,
  },
  {
    title: 'Petite',
    date: '2026-08-24',
    startTime: '09:00',
    endTime: '11:30',
    content: `LAY SAINT REMY (Eglise)
Animateur : Pascal
Lieu de départ : https://maps.app.goo.gl/KSVoXskUNfSYBd6H6`,
  },
  {
    title: 'Journée',
    date: '2026-08-24',
    startTime: '09:00',
    endTime: '17:00',
    content: `NEUFCHATEAU (parking mairie de Rollainville)
Animateur : Doudou
covoiturage Carrefour à 08:00
Lieu de départ : https://maps.app.goo.gl/6Vba3XtW7jC1KSCP6`,
  },
  {
    title: 'Santé',
    date: '2026-08-25',
    startTime: '09:30',
    endTime: '11:45',
    content: `CHOLOY (Mairie)
Animateur : Jean-Luc
Lieu de départ : https://maps.app.goo.gl/qVfvfH5RgCxP7rFd9`,
  },
  {
    title: 'Grande',
    date: '2026-08-27',
    startTime: '08:30',
    endTime: '11:45',
    content: `FONTENOY (Gare)
Animateur : Pascal
Lieu de départ : https://maps.app.goo.gl/DhpHM9EfDuTZYYCf9`,
  },
  {
    title: 'Petite',
    date: '2026-08-27',
    startTime: '09:00',
    endTime: '11:45',
    content: `MARON (ancienne Gare)
Animateur : Roland
Lieu de départ : https://maps.app.goo.gl/GfZmAzk4mPksRHFr5`,
  },
  {
    title: 'Nordique',
    date: '2026-08-28',
    startTime: '09:00',
    endTime: '11:30',
    content: `BOUCQ (terrain de foot)
Animateur : Bernard T.
km : 9,0 · D+ : 130 m
Lieu de départ : https://maps.app.goo.gl/a6KpaC6TdebhWHj37`,
  },
  {
    title: 'Douce',
    date: '2026-08-28',
    startTime: '09:30',
    endTime: '11:45',
    content: `ECROUVES (plateau)
Animateur : Gérald
Lieu de départ : https://maps.app.goo.gl/QZfCj7EsVr3DbDWX7`,
  },
  {
    title: 'Grande',
    date: '2026-08-31',
    startTime: '08:30',
    endTime: '11:45',
    content: `MARON (ancienne gare)
Animateur : Pascal
Lieu de départ : https://maps.app.goo.gl/GfZmAzk4mPksRHFr5`,
  },
  {
    title: 'Petite',
    date: '2026-08-31',
    startTime: '09:00',
    endTime: '11:30',
    content: `MONT LE VIGNOBLE (Cimetière)
Animateur : Philippe
Lieu de départ : https://maps.app.goo.gl/Z3oCqtaGHi96VBfj7`,
  },
  {
    title: 'Santé',
    date: '2026-09-01',
    startTime: '14:00',
    endTime: '16:15',
    content: `VILLEY LE SEC (Mairie)
Animateur : Muriel
Lieu de départ : https://maps.app.goo.gl/ozneCFqQ6tULcxie6`,
  },
  {
    title: 'Petite',
    date: '2026-09-03',
    startTime: '09:00',
    endTime: '11:30',
    content: `PAGNY SUR MEUSE (Gare)
Animateur : Jean-Luc
Lieu de départ : https://maps.app.goo.gl/NypUgPHzgVaPjkZ6A`,
  },
  {
    title: 'Grande',
    date: '2026-09-03',
    startTime: '14:00',
    endTime: '17:30',
    content: `SAULXURES LES VANNES (Parking Eglise)
Animateur : Francis
km : 13,0 · D+ : 220 m
Covoiturage Intermarché-Ex Colruyt à 13 h 30
Lieu de départ : https://maps.app.goo.gl/9yj7guonroVDfeht5`,
  },
  {
    title: 'Nordique',
    date: '2026-09-04',
    startTime: '09:00',
    endTime: '11:30',
    content: `TROUSSEY (Eglise)
Animateur : Bernard T.
Lieu de départ : https://maps.app.goo.gl/8ztt1UzDYj7zZhSZ7`,
  },
  {
    title: 'Douce',
    date: '2026-09-04',
    startTime: '14:00',
    endTime: '16:15',
    content: `VELAINE EN HAYE (terrain de foot)
Animateur : Gérald
Lieu de départ : https://maps.app.goo.gl/SUdCrjVEMrS6wsbV9`,
  },
  {
    title: 'Petite',
    date: '2026-09-07',
    startTime: '09:00',
    endTime: '11:30',
    content: `CHOLOY (Mairie)
Animateur : Michel
km : 9,0 · D+ : 92 m
Lieu de départ : https://maps.app.goo.gl/QdX8pKM3GpWcEsW39`,
  },
  {
    title: 'Grande',
    date: '2026-09-07',
    startTime: '14:00',
    endTime: '16:45',
    content: `MANONVILLE (Cimetière)
Animateur : Bernard A.
covoiturage LIDL CDM 13H30
Lieu de départ : https://maps.app.goo.gl/Sopa4FDGNnHwyFp26`,
  },
  {
    title: 'Santé',
    date: '2026-09-08',
    startTime: '09:30',
    endTime: '11:30',
    content: `BRULEY (Kiosque)
Animateur : Pascal
Lieu de départ : https://maps.app.goo.gl/sgBgTD29jGCYCS3H6`,
  },
  {
    title: 'Petite',
    date: '2026-09-10',
    startTime: '09:00',
    endTime: '11:30',
    content: `TOUL (Pont Bernon)
Animateur : Pascal
Lieu de départ : https://maps.app.goo.gl/qYmF5YiwDgbdBMUU8`,
  },
  {
    title: 'Grande',
    date: '2026-09-10',
    startTime: '14:00',
    endTime: '17:00',
    content: `CHAUDENEY (salle Bouchot)
Animateur : Philippe
Lieu de départ : https://maps.app.goo.gl/71tdjgm7k3xUirq67`,
  },
  {
    title: 'Nordique',
    date: '2026-09-11',
    startTime: '09:00',
    endTime: '11:30',
    content: `BRULEY (Eglise)
Animateur : Bernard A.
Lieu de départ : https://maps.app.goo.gl/qgyStRRaTeFt1yzm7`,
  },
  {
    title: 'Douce',
    date: '2026-09-11',
    startTime: '14:00',
    endTime: '16:15',
    content: `GYE (Mairie)
Animateur : Daniel D
Lieu de départ : https://maps.app.goo.gl/rcQs37rafDektJsU8`,
  },
  {
    title: 'Moyenne',
    date: '2026-09-14',
    startTime: '14:00',
    endTime: '16:45',
    content: `BLENOD LES TOUL (point de vue)
Animateur : Pascal
km : 11,1 · D+ : 137 m
Lieu de départ : https://maps.app.goo.gl/6MBhYX6YZTJ5Bzdh7`,
  },
  {
    title: 'Santé (sortie journée)',
    date: '2026-09-15',
    startTime: '14:00',
    endTime: '16:15',
    content: `LAC DU DER
Animateur : Patricia
covoiturage Intermarché contact (ancien Colryut) à 08H30
Lieu de départ : https://maps.app.goo.gl/LPGGQCMisGgfZMdC6`,
  },
  {
    title: 'Petite',
    date: '2026-09-17',
    startTime: '14:00',
    endTime: '16:30',
    content: `VILLEY SAINT ETIENNE (Pavillon Bleu)
Animateur : Philippe
Lieu de départ : https://maps.app.goo.gl/LeMmcYaHHBsLDES19`,
  },
  {
    title: 'Grande',
    date: '2026-09-17',
    startTime: '14:00',
    endTime: '17:00',
    content: `VITERNE (Stade de foot)
Animateur : Jean Luc
Lieu de départ : https://maps.app.goo.gl/oAgVZGdxLtnjHKSx5`,
  },
  {
    title: 'Nordique',
    date: '2026-09-18',
    startTime: '09:00',
    endTime: '11:30',
    content: `FONTENOY (Gare)
Animateur : Bernard A.
Lieu de départ : https://maps.app.goo.gl/PYhY5ZvCXCW3LJLy7`,
  },
  {
    title: 'Marche Breathwalk',
    date: '2026-09-18',
    startTime: '10:00',
    endTime: '12:00',
    content: `ETANGS DE CHAUDENEY (Parking Kayak)
Animateur : Danièle (Subtil)
Sur inscription uniquement (voir site)
Lieu de départ : https://maps.app.goo.gl/CDz5yrdS3S86NteW6`,
  },
  {
    title: 'Journée interclubs santé',
    date: '2026-09-19',
    startTime: '09:00',
    endTime: '18:00',
    content: `SAINT-MAX (Chateau)
Animateur : Jean-Luc (CD54)
Inscription obligatoire
https://forms.gle/7c5QjegnhgkJ57uL8
Départ bus à 08H20 (Arsenal)`,
  },
  {
    title: 'Sortie journée',
    date: '2026-09-20',
    startTime: '10:00',
    endTime: '17:30',
    content: `LAY SAINT CHRISTOPHE (Salle des fêtes Pierre Rotach)
Animateur : Isabelle
Lieu de départ : https://maps.app.goo.gl/2YcR59dUFnkLfTvKA`,
  },
  {
    title: 'Petite',
    date: '2026-09-21',
    startTime: '14:00',
    endTime: '16:30',
    content: `PIERRE LA TREICHE (Salle Poussot)
Animateur : Isabelle
Lieu de départ : https://maps.app.goo.gl/xEXPpprNPWQZcvZb7`,
  },
  {
    title: 'Grande',
    date: '2026-09-21',
    startTime: '14:00',
    endTime: '16:45',
    content: `CLAIRLIEU (parking carrefour de la haute borne avant Clairlieu)
Animateur : Doudou
Lieu de départ : https://maps.app.goo.gl/Hyx8vqnsEd21sbpF7`,
  },
  {
    title: 'Santé',
    date: '2026-09-22',
    startTime: '14:00',
    endTime: '16:15',
    content: `TOUL CROIX DE METZ (Toul Padel Club)
Animateur : Pascal
Lieu de départ : https://maps.app.goo.gl/fgBaLmbVNHgsAavKA`,
  },
  {
    title: 'Petite',
    date: '2026-09-24',
    startTime: '14:00',
    endTime: '16:30',
    content: `THUILLEY AUX GROSEILLES (parking salle des fêtes)
Animateur : Michel
km : 10,0 · D+ : 142 m
Lieu de départ : https://maps.app.goo.gl/zU3byfDrwFhZRr4H7`,
  },
  {
    title: 'Journée',
    date: '2026-09-24',
    startTime: '14:00',
    endTime: '17:00',
    content: `LE BONHOMME - LE GRAND BREZOUARD
Animateur : Jean-Marie
covoiturage Carrefour à 07H30
Lieu de départ : https://maps.app.goo.gl/GPiBYzMQ5NohHrmq7`,
  },
  {
    title: 'Nordique',
    date: '2026-09-25',
    startTime: '09:00',
    endTime: '11:30',
    content: `CHAUDENEY (salle Bouchot)
Animateur : Bernard A.
Lieu de départ : https://maps.app.goo.gl/6vPvjX62FVQL7Dbs8`,
  },
  {
    title: 'Douce',
    date: '2026-09-25',
    startTime: '14:00',
    endTime: '16:15',
    content: `ALLAIN (aire de covoiturage)
Animateur : Daniel D
Lieu de départ : https://maps.app.goo.gl/iis7L8j5rWrVBRqd8`,
  },
  {
    title: 'Petite',
    date: '2026-09-28',
    startTime: '14:00',
    endTime: '16:30',
    content: `CORNIEVILLE (parking milieu du village)
Animateur : Gérald
Lieu de départ : https://maps.app.goo.gl/a9reeTAKWGZZfHJw8`,
  },
  {
    title: 'Grande',
    date: '2026-09-28',
    startTime: '14:00',
    endTime: '16:45',
    content: `PAGNEY DERRIERE BARINE (Les Acacias)
Animateur : Jean-Marie
Lieu de départ : https://maps.app.goo.gl/nK3aknincArtnstTA`,
  },
  {
    title: 'Santé',
    date: '2026-09-29',
    startTime: '14:00',
    endTime: '16:15',
    content: `BICQUELEY (Rue de la Poirière, tas de bois)
Animateur : Muriel
Lieu de départ : https://maps.app.goo.gl/Xja52hs2whEg68NQA`,
  },
]
