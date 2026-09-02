import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The `adherents` collection: two tables, two enums, and one relation column on
 * `payload_locked_documents_rels` — which gains one per collection, so this is
 * the twenty-fifth.
 *
 * Purely additive. Nothing existing is dropped or rewritten, and no page reads
 * the collection yet, so the schema can go out well ahead of the import and the
 * pages. `users` is untouched: the link between the two lives in
 * `adherents.user`, and the `adherent` field on a user is a join, which is
 * virtual and costs no column.
 *
 * Two unique indexes carry the design, and both are unique over a *nullable*
 * column on purpose:
 *
 *   adherents_licence_idx  — the licence is the key for reconciling the club's
 *     spreadsheet against these rows, but it cannot be required: three people in
 *     the sheet have none, and anyone joining mid-season has none until the
 *     FFRandonnée issues one. Postgres admits any number of NULLs under a unique
 *     index, which is what lets both facts hold at once — hence `normaliseLicence`
 *     turning a blank into NULL rather than `''`, which would collide.
 *
 *   adherents_user_idx — an account belongs to at most one adhérent. Most rows
 *     will hold NULL here for the foreseeable future; the club's median age is
 *     71 and its 276 members share only 233 e-mail addresses, so adhérent and
 *     user were never going to be the same table.
 *
 * `household_id` is a self-referencing FK, for the sheet's `Rattaché(e)` column.
 * `ON DELETE set null`, so removing one member of a household does not cascade
 * into deleting the rest of it.
 *
 * The three `publication_consent_*` booleans default to false, which means every
 * page that will eventually read this collection matches nobody until consent is
 * recorded. That is deliberate: the pages keep their lists in `src/data` until
 * each one's permissions are collected.
 *
 * `down` drops the relation constraint with `IF EXISTS`, as the two migrations
 * that added `locations` and `outing_categories` do. Dropping `adherents` with
 * `CASCADE` above already takes with it every foreign key that referenced it,
 * this one included, so naming it unconditionally afterwards would raise
 * "constraint does not exist" and abort the whole rollback. The `DROP INDEX`
 * below stays unconditional on purpose: that index hangs off the surviving
 * `payload_locked_documents_rels.adherents_id` column rather than off the
 * dropped table, so the cascade does not reach it.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_adherents_status" AS ENUM('prospect', 'pending', 'active', 'lapsed', 'former');
  CREATE TYPE "public"."enum_adherents_civility" AS ENUM('mme', 'mr');
  CREATE TABLE "adherents_adhesions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"season" varchar NOT NULL,
  	"paid_on" timestamp(3) with time zone,
  	"amount_ffr" numeric,
  	"amount_club" numeric,
  	"note" varchar
  );
  
  CREATE TABLE "adherents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_adherents_status" DEFAULT 'prospect' NOT NULL,
  	"user_id" integer,
  	"civility" "enum_adherents_civility",
  	"last_name" varchar NOT NULL,
  	"first_name" varchar,
  	"full_name" varchar,
  	"birth_date" timestamp(3) with time zone,
  	"household_id" integer,
  	"email" varchar,
  	"phone" varchar,
  	"street_number" varchar,
  	"address" varchar,
  	"postal_code" varchar,
  	"city" varchar,
  	"photo_id" integer,
  	"publication_consent_photo" boolean DEFAULT false,
  	"publication_consent_phone" boolean DEFAULT false,
  	"publication_consent_email" boolean DEFAULT false,
  	"licence" varchar,
  	"licence_club" varchar,
  	"medical_certificate_date" timestamp(3) with time zone,
  	"board_role" varchar,
  	"board_rank" numeric,
  	"is_animateur" boolean DEFAULT false,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "adherents_id" integer;
  ALTER TABLE "adherents_adhesions" ADD CONSTRAINT "adherents_adhesions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."adherents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "adherents" ADD CONSTRAINT "adherents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "adherents" ADD CONSTRAINT "adherents_household_id_adherents_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."adherents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "adherents" ADD CONSTRAINT "adherents_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "adherents_adhesions_order_idx" ON "adherents_adhesions" USING btree ("_order");
  CREATE INDEX "adherents_adhesions_parent_id_idx" ON "adherents_adhesions" USING btree ("_parent_id");
  CREATE INDEX "adherents_status_idx" ON "adherents" USING btree ("status");
  CREATE UNIQUE INDEX "adherents_user_idx" ON "adherents" USING btree ("user_id");
  CREATE INDEX "adherents_last_name_idx" ON "adherents" USING btree ("last_name");
  CREATE INDEX "adherents_full_name_idx" ON "adherents" USING btree ("full_name");
  CREATE INDEX "adherents_household_idx" ON "adherents" USING btree ("household_id");
  CREATE INDEX "adherents_photo_idx" ON "adherents" USING btree ("photo_id");
  CREATE UNIQUE INDEX "adherents_licence_idx" ON "adherents" USING btree ("licence");
  CREATE INDEX "adherents_is_animateur_idx" ON "adherents" USING btree ("is_animateur");
  CREATE INDEX "adherents_updated_at_idx" ON "adherents" USING btree ("updated_at");
  CREATE INDEX "adherents_created_at_idx" ON "adherents" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_adherents_fk" FOREIGN KEY ("adherents_id") REFERENCES "public"."adherents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_adherents_id_idx" ON "payload_locked_documents_rels" USING btree ("adherents_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "adherents_adhesions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "adherents" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "adherents_adhesions" CASCADE;
  DROP TABLE "adherents" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_adherents_fk";
  
  DROP INDEX "payload_locked_documents_rels_adherents_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "adherents_id";
  DROP TYPE "public"."enum_adherents_status";
  DROP TYPE "public"."enum_adherents_civility";`)
}
