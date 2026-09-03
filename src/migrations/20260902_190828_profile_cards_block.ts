import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The `profileCards` block, so a page can carry a list of adhérents rendered as
 * profile cards — the conseil d'administration to begin with.
 *
 * Purely additive: two tables for the block, one for pages and one for their
 * versions, and an `adherents_id` column on the two rels tables that already
 * exist. Payload keeps every relationship out of a page in `pages_rels` rather
 * than a table per field, so a new relation target is a column there.
 *
 * `ON DELETE cascade` on those columns is Payload's own choice and the right
 * one here: deleting an adhérent removes them from any list that named them,
 * rather than leaving a page pointing at nothing.
 *
 * Nothing is dropped and nothing existing is rewritten, so this can go out ahead
 * of anyone building the page — and until somebody does, the block is an option
 * in the editor that no page has taken up.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_profile_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_profile_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_rels" ADD COLUMN "adherents_id" integer;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "adherents_id" integer;
  ALTER TABLE "pages_blocks_profile_cards" ADD CONSTRAINT "pages_blocks_profile_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_profile_cards" ADD CONSTRAINT "_pages_v_blocks_profile_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_profile_cards_order_idx" ON "pages_blocks_profile_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_profile_cards_parent_id_idx" ON "pages_blocks_profile_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_profile_cards_path_idx" ON "pages_blocks_profile_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_profile_cards_order_idx" ON "_pages_v_blocks_profile_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_profile_cards_parent_id_idx" ON "_pages_v_blocks_profile_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_profile_cards_path_idx" ON "_pages_v_blocks_profile_cards" USING btree ("_path");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_adherents_fk" FOREIGN KEY ("adherents_id") REFERENCES "public"."adherents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_adherents_fk" FOREIGN KEY ("adherents_id") REFERENCES "public"."adherents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_adherents_id_idx" ON "pages_rels" USING btree ("adherents_id");
  CREATE INDEX "_pages_v_rels_adherents_id_idx" ON "_pages_v_rels" USING btree ("adherents_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_profile_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_profile_cards" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_profile_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_profile_cards" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_adherents_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_adherents_fk";
  
  DROP INDEX "pages_rels_adherents_id_idx";
  DROP INDEX "_pages_v_rels_adherents_id_idx";
  ALTER TABLE "pages_rels" DROP COLUMN "adherents_id";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "adherents_id";`)
}
