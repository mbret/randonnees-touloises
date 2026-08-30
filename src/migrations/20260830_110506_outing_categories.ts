import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The kind of outing as a document of its own, pointed at by an event.
 *
 * Purely additive, and the same shape as the start-location migration before
 * it: a new table, and a nullable foreign key on `events`, on its versions
 * table and on the lock table. Nothing is dropped and nothing is rewritten, so
 * the schema can go out ahead of the code that reads it.
 *
 * `events.title` becomes optional in this change too, but not here: a
 * draft-enabled collection is already nullable in Postgres — a draft has to be
 * saveable half-filled — so dropping `required` moves nothing in the database
 * and the generator, correctly, wrote no statement for it.
 *
 * `IF EXISTS` on the three `DROP CONSTRAINT` statements in `down` is the same
 * correction to the generator's output that the start-location migration
 * carries, for the same reason: `DROP TABLE "outing_categories" CASCADE` above
 * them has already taken those constraints with it, so dropping them by name
 * raises « constraint ... does not exist » and rolls the whole rollback back.
 * Verified down, then up again, against a real database.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "outing_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"logo_id" integer,
  	"summary" varchar,
  	"sort_order" numeric,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "events" ADD COLUMN "outing_category_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_outing_category_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "outing_categories_id" integer;
  ALTER TABLE "outing_categories" ADD CONSTRAINT "outing_categories_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "outing_categories_logo_idx" ON "outing_categories" USING btree ("logo_id");
  CREATE UNIQUE INDEX "outing_categories_slug_idx" ON "outing_categories" USING btree ("slug");
  CREATE INDEX "outing_categories_updated_at_idx" ON "outing_categories" USING btree ("updated_at");
  CREATE INDEX "outing_categories_created_at_idx" ON "outing_categories" USING btree ("created_at");
  ALTER TABLE "events" ADD CONSTRAINT "events_outing_category_id_outing_categories_id_fk" FOREIGN KEY ("outing_category_id") REFERENCES "public"."outing_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_outing_category_id_outing_categories_id_fk" FOREIGN KEY ("version_outing_category_id") REFERENCES "public"."outing_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_outing_categories_fk" FOREIGN KEY ("outing_categories_id") REFERENCES "public"."outing_categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_outing_category_idx" ON "events" USING btree ("outing_category_id");
  CREATE INDEX "_events_v_version_version_outing_category_idx" ON "_events_v" USING btree ("version_outing_category_id");
  CREATE INDEX "payload_locked_documents_rels_outing_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("outing_categories_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "outing_categories" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "outing_categories" CASCADE;
  ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_outing_category_id_outing_categories_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT IF EXISTS "_events_v_version_outing_category_id_outing_categories_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_outing_categories_fk";
  
  DROP INDEX "events_outing_category_idx";
  DROP INDEX "_events_v_version_version_outing_category_idx";
  DROP INDEX "payload_locked_documents_rels_outing_categories_id_idx";
  ALTER TABLE "events" DROP COLUMN "outing_category_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_outing_category_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "outing_categories_id";`)
}
