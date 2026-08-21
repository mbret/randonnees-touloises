import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_icon_cards_cards_icon" AS ENUM('compass', 'handshake', 'users', 'map', 'calendar', 'shield', 'mountain', 'footprints');
  CREATE TYPE "public"."enum_pages_blocks_icon_cards_media_position" AS ENUM('right', 'left');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_cards_cards_icon" AS ENUM('compass', 'handshake', 'users', 'map', 'calendar', 'shield', 'mountain', 'footprints');
  CREATE TYPE "public"."enum__pages_v_blocks_icon_cards_media_position" AS ENUM('right', 'left');
  CREATE TABLE "pages_blocks_icon_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_icon_cards_cards_icon" DEFAULT 'compass',
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "pages_blocks_icon_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"media_position" "enum_pages_blocks_icon_cards_media_position" DEFAULT 'right',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_icon_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_icon_cards_cards_icon" DEFAULT 'compass',
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_icon_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"media_position" "enum__pages_v_blocks_icon_cards_media_position" DEFAULT 'right',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_icon_cards_cards" ADD CONSTRAINT "pages_blocks_icon_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_icon_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_icon_cards" ADD CONSTRAINT "pages_blocks_icon_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_icon_cards" ADD CONSTRAINT "pages_blocks_icon_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_icon_cards_cards" ADD CONSTRAINT "_pages_v_blocks_icon_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_icon_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_icon_cards" ADD CONSTRAINT "_pages_v_blocks_icon_cards_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_icon_cards" ADD CONSTRAINT "_pages_v_blocks_icon_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_icon_cards_cards_order_idx" ON "pages_blocks_icon_cards_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_icon_cards_cards_parent_id_idx" ON "pages_blocks_icon_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_icon_cards_order_idx" ON "pages_blocks_icon_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_icon_cards_parent_id_idx" ON "pages_blocks_icon_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_icon_cards_path_idx" ON "pages_blocks_icon_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_icon_cards_media_idx" ON "pages_blocks_icon_cards" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_icon_cards_cards_order_idx" ON "_pages_v_blocks_icon_cards_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_icon_cards_cards_parent_id_idx" ON "_pages_v_blocks_icon_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_icon_cards_order_idx" ON "_pages_v_blocks_icon_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_icon_cards_parent_id_idx" ON "_pages_v_blocks_icon_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_icon_cards_path_idx" ON "_pages_v_blocks_icon_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_icon_cards_media_idx" ON "_pages_v_blocks_icon_cards" USING btree ("media_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_icon_cards_cards" CASCADE;
  DROP TABLE "pages_blocks_icon_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_icon_cards_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_icon_cards" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_icon_cards_cards_icon";
  DROP TYPE "public"."enum_pages_blocks_icon_cards_media_position";
  DROP TYPE "public"."enum__pages_v_blocks_icon_cards_cards_icon";
  DROP TYPE "public"."enum__pages_v_blocks_icon_cards_media_position";`)
}
