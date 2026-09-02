import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Drops the `teamDirectory` global and the `teamSectionBlock` that was its only
 * reader. Both went unused: the block declared no fields of its own and pulled
 * the whole roster from the global, while the three pages that actually show
 * people — /board, /animation-team, /trombinoscope — read the hardcoded lists in
 * `src/data`. So the global was a second, empty way to say what those files
 * already said, and nothing ever wired the two together.
 *
 * Six tables rather than four: a block contributes one table per collection that
 * offers it, plus one for that collection's versions, hence
 * `pages_blocks_team_section_block` and `_pages_v_blocks_team_section_block`
 * alongside the global's own four. The two enums belong to the contact- and
 * social-link arrays and have no other user, so they go too.
 *
 * `down` restores the schema but not the content — these are DROPs, so anything
 * the global held, or any block a page carried, is gone once this runs. That is
 * only safe because both were empty; confirm it against the target database
 * before applying, rather than trusting this note:
 *
 *   SELECT (SELECT count(*) FROM team_directory_team_members) AS members,
 *          (SELECT count(*) FROM pages_blocks_team_section_block) AS blocks;
 *
 * Non-zero on either means a page or the global is publishing something this
 * would delete, and the roster work should carry it over first.
 *
 * The `CASCADE` on each DROP takes the child tables' foreign keys with it, which
 * is why `down` has to recreate the constraints and indexes explicitly after the
 * tables rather than relying on the column definitions alone.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_team_section_block" CASCADE;
  DROP TABLE "_pages_v_blocks_team_section_block" CASCADE;
  DROP TABLE "team_directory_team_members_contact_links" CASCADE;
  DROP TABLE "team_directory_team_members_social_links" CASCADE;
  DROP TABLE "team_directory_team_members" CASCADE;
  DROP TABLE "team_directory" CASCADE;
  DROP TYPE "public"."enum_team_directory_team_members_contact_links_type";
  DROP TYPE "public"."enum_team_directory_team_members_social_links_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_team_directory_team_members_contact_links_type" AS ENUM('email', 'phone', 'whatsapp', 'telegram', 'skype', 'custom');
  CREATE TYPE "public"."enum_team_directory_team_members_social_links_type" AS ENUM('facebook', 'twitter', 'linkedin', 'instagram', 'github', 'youtube', 'custom');
  CREATE TABLE "pages_blocks_team_section_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_team_section_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "team_directory_team_members_contact_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_team_directory_team_members_contact_links_type" DEFAULT 'phone',
  	"custom_name" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "team_directory_team_members_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_team_directory_team_members_social_links_type" DEFAULT 'facebook',
  	"custom_name" varchar,
  	"uri" varchar
  );
  
  CREATE TABLE "team_directory_team_members" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" varchar,
  	"description" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "team_directory" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "pages_blocks_team_section_block" ADD CONSTRAINT "pages_blocks_team_section_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_section_block" ADD CONSTRAINT "_pages_v_blocks_team_section_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_directory_team_members_contact_links" ADD CONSTRAINT "team_directory_team_members_contact_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_directory_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_directory_team_members_social_links" ADD CONSTRAINT "team_directory_team_members_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_directory_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_directory_team_members" ADD CONSTRAINT "team_directory_team_members_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_directory_team_members" ADD CONSTRAINT "team_directory_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_directory"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_team_section_block_order_idx" ON "pages_blocks_team_section_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_section_block_parent_id_idx" ON "pages_blocks_team_section_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_section_block_path_idx" ON "pages_blocks_team_section_block" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_team_section_block_order_idx" ON "_pages_v_blocks_team_section_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_team_section_block_parent_id_idx" ON "_pages_v_blocks_team_section_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_team_section_block_path_idx" ON "_pages_v_blocks_team_section_block" USING btree ("_path");
  CREATE INDEX "team_directory_team_members_contact_links_order_idx" ON "team_directory_team_members_contact_links" USING btree ("_order");
  CREATE INDEX "team_directory_team_members_contact_links_parent_id_idx" ON "team_directory_team_members_contact_links" USING btree ("_parent_id");
  CREATE INDEX "team_directory_team_members_social_links_order_idx" ON "team_directory_team_members_social_links" USING btree ("_order");
  CREATE INDEX "team_directory_team_members_social_links_parent_id_idx" ON "team_directory_team_members_social_links" USING btree ("_parent_id");
  CREATE INDEX "team_directory_team_members_order_idx" ON "team_directory_team_members" USING btree ("_order");
  CREATE INDEX "team_directory_team_members_parent_id_idx" ON "team_directory_team_members" USING btree ("_parent_id");
  CREATE INDEX "team_directory_team_members_image_idx" ON "team_directory_team_members" USING btree ("image_id");`)
}
