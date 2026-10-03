import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * The `trombinoscope` block, so a page can show every adhérent with a portrait
 * and permission to publish it.
 *
 * Purely additive: two tables for the block, one for pages and one for their
 * versions. They hold nothing but the block's place on a page — the list is
 * read from `adherents` when the page renders, so unlike `profileCards` there is
 * no relationship column to add.
 *
 * Nothing is dropped and nothing existing is rewritten, so this can go out ahead
 * of the page that uses it. Until somebody builds that page the block is an
 * option in the editor that nothing has taken up, and even then the coded
 * `src/app/(frontend)/trombinoscope` route keeps answering /trombinoscope until
 * it is deleted.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_trombinoscope" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_trombinoscope" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_trombinoscope" ADD CONSTRAINT "pages_blocks_trombinoscope_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_trombinoscope" ADD CONSTRAINT "_pages_v_blocks_trombinoscope_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_trombinoscope_order_idx" ON "pages_blocks_trombinoscope" USING btree ("_order");
  CREATE INDEX "pages_blocks_trombinoscope_parent_id_idx" ON "pages_blocks_trombinoscope" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_trombinoscope_path_idx" ON "pages_blocks_trombinoscope" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_trombinoscope_order_idx" ON "_pages_v_blocks_trombinoscope" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_trombinoscope_parent_id_idx" ON "_pages_v_blocks_trombinoscope" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_trombinoscope_path_idx" ON "_pages_v_blocks_trombinoscope" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_trombinoscope" CASCADE;
  DROP TABLE "_pages_v_blocks_trombinoscope" CASCADE;`)
}
