import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_media_links_items_platform" AS ENUM('googlePhotos', 'youtube', 'other');
  CREATE TYPE "public"."enum__pages_v_blocks_media_links_items_platform" AS ENUM('googlePhotos', 'youtube', 'other');
  CREATE TABLE "pages_blocks_media_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_pages_blocks_media_links_items_platform" DEFAULT 'googlePhotos',
  	"title" varchar,
  	"description" varchar,
  	"date" timestamp(3) with time zone,
  	"url" varchar,
  	"cover_id" integer
  );
  
  CREATE TABLE "pages_blocks_media_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_links_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__pages_v_blocks_media_links_items_platform" DEFAULT 'googlePhotos',
  	"title" varchar,
  	"description" varchar,
  	"date" timestamp(3) with time zone,
  	"url" varchar,
  	"cover_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_media_links_items" ADD CONSTRAINT "pages_blocks_media_links_items_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_links_items" ADD CONSTRAINT "pages_blocks_media_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_media_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_links" ADD CONSTRAINT "pages_blocks_media_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_links_items" ADD CONSTRAINT "_pages_v_blocks_media_links_items_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_links_items" ADD CONSTRAINT "_pages_v_blocks_media_links_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_media_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_links" ADD CONSTRAINT "_pages_v_blocks_media_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_media_links_items_order_idx" ON "pages_blocks_media_links_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_links_items_parent_id_idx" ON "pages_blocks_media_links_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_links_items_cover_idx" ON "pages_blocks_media_links_items" USING btree ("cover_id");
  CREATE INDEX "pages_blocks_media_links_order_idx" ON "pages_blocks_media_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_links_parent_id_idx" ON "pages_blocks_media_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_links_path_idx" ON "pages_blocks_media_links" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_links_items_order_idx" ON "_pages_v_blocks_media_links_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_links_items_parent_id_idx" ON "_pages_v_blocks_media_links_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_links_items_cover_idx" ON "_pages_v_blocks_media_links_items" USING btree ("cover_id");
  CREATE INDEX "_pages_v_blocks_media_links_order_idx" ON "_pages_v_blocks_media_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_links_parent_id_idx" ON "_pages_v_blocks_media_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_links_path_idx" ON "_pages_v_blocks_media_links" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_media_links_items" CASCADE;
  DROP TABLE "pages_blocks_media_links" CASCADE;
  DROP TABLE "_pages_v_blocks_media_links_items" CASCADE;
  DROP TABLE "_pages_v_blocks_media_links" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_media_links_items_platform";
  DROP TYPE "public"."enum__pages_v_blocks_media_links_items_platform";`)
}
