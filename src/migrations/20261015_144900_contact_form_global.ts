import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * `contactForm`: the global « Formulaire de contact », where the admin chooses
 * the address the contact page's messages are emailed to and the one they are
 * sent from.
 *
 * A new table, so nothing existing is touched. The global has no row until it
 * is first saved, and until then no email goes out: the recipient is empty,
 * and the messages are kept in « Messages de contact » as before.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "contact_form" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"recipient" varchar,
  	"sender" varchar DEFAULT 'contact@randonnees-touloises.net' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "contact_form" CASCADE;`)
}
