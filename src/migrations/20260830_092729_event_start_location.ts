import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Start locations as documents of their own, pointed at by an event.
 *
 * Purely additive: a new table, and a nullable foreign key on `events`, on its
 * versions table and on the lock table. Nothing is dropped and nothing is
 * rewritten, so the schema moving ahead of the code that reads it — which is
 * what took the site down in August — cannot happen here.
 *
 * `IF EXISTS` on the three `DROP CONSTRAINT` statements in `down` is a
 * correction to what the generator wrote, not a precaution: `DROP TABLE
 * "locations" CASCADE` above them has already taken those constraints with it,
 * so dropping them by name raised « constraint ... does not exist » and rolled
 * the whole rollback back. Verified down, then up again, against a real
 * database.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "locations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"commune" varchar NOT NULL,
  	"spot" varchar,
  	"title" varchar,
  	"latitude" numeric,
  	"longitude" numeric,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "events" ADD COLUMN "start_location_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_start_location_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "locations_id" integer;
  CREATE INDEX "locations_commune_idx" ON "locations" USING btree ("commune");
  CREATE INDEX "locations_title_idx" ON "locations" USING btree ("title");
  CREATE INDEX "locations_updated_at_idx" ON "locations" USING btree ("updated_at");
  CREATE INDEX "locations_created_at_idx" ON "locations" USING btree ("created_at");
  ALTER TABLE "events" ADD CONSTRAINT "events_start_location_id_locations_id_fk" FOREIGN KEY ("start_location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_start_location_id_locations_id_fk" FOREIGN KEY ("version_start_location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_locations_fk" FOREIGN KEY ("locations_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_start_location_idx" ON "events" USING btree ("start_location_id");
  CREATE INDEX "_events_v_version_version_start_location_idx" ON "_events_v" USING btree ("version_start_location_id");
  CREATE INDEX "payload_locked_documents_rels_locations_id_idx" ON "payload_locked_documents_rels" USING btree ("locations_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "locations" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "locations" CASCADE;
  ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "events_start_location_id_locations_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT IF EXISTS "_events_v_version_start_location_id_locations_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_locations_fk";
  
  DROP INDEX "events_start_location_idx";
  DROP INDEX "_events_v_version_version_start_location_idx";
  DROP INDEX "payload_locked_documents_rels_locations_id_idx";
  ALTER TABLE "events" DROP COLUMN "start_location_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_start_location_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "locations_id";`)
}
