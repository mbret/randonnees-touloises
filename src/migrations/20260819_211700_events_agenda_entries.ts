import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_populated_authors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_version_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_version_populated_authors" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "events_visibility" CASCADE;
  DROP TABLE "events_populated_authors" CASCADE;
  DROP TABLE "_events_v_version_visibility" CASCADE;
  DROP TABLE "_events_v_version_populated_authors" CASCADE;
  ALTER TABLE "events" DROP CONSTRAINT "events_hero_image_id_media_id_fk";
  
  ALTER TABLE "events" DROP CONSTRAINT "events_meta_image_id_media_id_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_events_fk";
  
  ALTER TABLE "events_rels" DROP CONSTRAINT "events_rels_users_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_hero_image_id_media_id_fk";
  
  ALTER TABLE "_events_v" DROP CONSTRAINT "_events_v_version_meta_image_id_media_id_fk";
  
  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_events_fk";
  
  ALTER TABLE "_events_v_rels" DROP CONSTRAINT "_events_v_rels_users_fk";
  
  DROP INDEX "events_hero_image_idx";
  DROP INDEX "events_meta_meta_image_idx";
  DROP INDEX "events_slug_idx";
  DROP INDEX "events_rels_events_id_idx";
  DROP INDEX "events_rels_users_id_idx";
  DROP INDEX "_events_v_version_version_hero_image_idx";
  DROP INDEX "_events_v_version_meta_version_meta_image_idx";
  DROP INDEX "_events_v_version_version_slug_idx";
  DROP INDEX "_events_v_autosave_idx";
  DROP INDEX "_events_v_rels_events_id_idx";
  DROP INDEX "_events_v_rels_users_id_idx";
  ALTER TABLE "posts" ADD COLUMN "require_content_password" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "version_require_content_password" boolean;
  ALTER TABLE "events" ADD COLUMN "date" timestamp(3) with time zone;
  ALTER TABLE "events" ADD COLUMN "start_time" varchar;
  ALTER TABLE "events" ADD COLUMN "end_time" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_date" timestamp(3) with time zone;
  ALTER TABLE "_events_v" ADD COLUMN "version_start_time" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_end_time" varchar;
  CREATE INDEX "events_date_idx" ON "events" USING btree ("date");
  CREATE INDEX "_events_v_version_version_date_idx" ON "_events_v" USING btree ("version_date");
  ALTER TABLE "events" DROP COLUMN "hero_image_id";
  ALTER TABLE "events" DROP COLUMN "meta_title";
  ALTER TABLE "events" DROP COLUMN "meta_image_id";
  ALTER TABLE "events" DROP COLUMN "meta_description";
  ALTER TABLE "events" DROP COLUMN "published_at";
  ALTER TABLE "events" DROP COLUMN "require_content_password";
  ALTER TABLE "events" DROP COLUMN "generate_slug";
  ALTER TABLE "events" DROP COLUMN "slug";
  ALTER TABLE "events_rels" DROP COLUMN "events_id";
  ALTER TABLE "events_rels" DROP COLUMN "users_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_hero_image_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_meta_title";
  ALTER TABLE "_events_v" DROP COLUMN "version_meta_image_id";
  ALTER TABLE "_events_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_events_v" DROP COLUMN "version_published_at";
  ALTER TABLE "_events_v" DROP COLUMN "version_require_content_password";
  ALTER TABLE "_events_v" DROP COLUMN "version_generate_slug";
  ALTER TABLE "_events_v" DROP COLUMN "version_slug";
  ALTER TABLE "_events_v" DROP COLUMN "autosave";
  ALTER TABLE "_events_v_rels" DROP COLUMN "events_id";
  ALTER TABLE "_events_v_rels" DROP COLUMN "users_id";
  DROP TYPE "public"."enum_events_visibility";
  DROP TYPE "public"."enum__events_v_version_visibility";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_events_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum__events_v_version_visibility" AS ENUM('admin', 'customer');
  CREATE TABLE "events_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_events_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "events_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar
  );
  
  CREATE TABLE "_events_v_version_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__events_v_version_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_events_v_version_populated_authors" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"name" varchar
  );
  
  DROP INDEX "events_date_idx";
  DROP INDEX "_events_v_version_version_date_idx";
  ALTER TABLE "events" ADD COLUMN "hero_image_id" integer;
  ALTER TABLE "events" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "events" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "events" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "events" ADD COLUMN "published_at" timestamp(3) with time zone;
  ALTER TABLE "events" ADD COLUMN "require_content_password" boolean;
  ALTER TABLE "events" ADD COLUMN "generate_slug" boolean DEFAULT true;
  ALTER TABLE "events" ADD COLUMN "slug" varchar;
  ALTER TABLE "events_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "events_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_hero_image_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_meta_title" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_meta_image_id" integer;
  ALTER TABLE "_events_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "version_published_at" timestamp(3) with time zone;
  ALTER TABLE "_events_v" ADD COLUMN "version_require_content_password" boolean;
  ALTER TABLE "_events_v" ADD COLUMN "version_generate_slug" boolean DEFAULT true;
  ALTER TABLE "_events_v" ADD COLUMN "version_slug" varchar;
  ALTER TABLE "_events_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_events_v_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "_events_v_rels" ADD COLUMN "users_id" integer;
  ALTER TABLE "events_visibility" ADD CONSTRAINT "events_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_populated_authors" ADD CONSTRAINT "events_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_visibility" ADD CONSTRAINT "_events_v_version_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_populated_authors" ADD CONSTRAINT "_events_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_visibility_order_idx" ON "events_visibility" USING btree ("order");
  CREATE INDEX "events_visibility_parent_idx" ON "events_visibility" USING btree ("parent_id");
  CREATE INDEX "events_populated_authors_order_idx" ON "events_populated_authors" USING btree ("_order");
  CREATE INDEX "events_populated_authors_parent_id_idx" ON "events_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "_events_v_version_visibility_order_idx" ON "_events_v_version_visibility" USING btree ("order");
  CREATE INDEX "_events_v_version_visibility_parent_idx" ON "_events_v_version_visibility" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_populated_authors_order_idx" ON "_events_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX "_events_v_version_populated_authors_parent_id_idx" ON "_events_v_version_populated_authors" USING btree ("_parent_id");
  ALTER TABLE "events" ADD CONSTRAINT "events_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "events_hero_image_idx" ON "events" USING btree ("hero_image_id");
  CREATE INDEX "events_meta_meta_image_idx" ON "events" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_rels_events_id_idx" ON "events_rels" USING btree ("events_id");
  CREATE INDEX "events_rels_users_id_idx" ON "events_rels" USING btree ("users_id");
  CREATE INDEX "_events_v_version_version_hero_image_idx" ON "_events_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_events_v_version_meta_version_meta_image_idx" ON "_events_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_autosave_idx" ON "_events_v" USING btree ("autosave");
  CREATE INDEX "_events_v_rels_events_id_idx" ON "_events_v_rels" USING btree ("events_id");
  CREATE INDEX "_events_v_rels_users_id_idx" ON "_events_v_rels" USING btree ("users_id");
  ALTER TABLE "posts" DROP COLUMN "require_content_password";
  ALTER TABLE "_posts_v" DROP COLUMN "version_require_content_password";
  ALTER TABLE "events" DROP COLUMN "date";
  ALTER TABLE "events" DROP COLUMN "start_time";
  ALTER TABLE "events" DROP COLUMN "end_time";
  ALTER TABLE "_events_v" DROP COLUMN "version_date";
  ALTER TABLE "_events_v" DROP COLUMN "version_start_time";
  ALTER TABLE "_events_v" DROP COLUMN "version_end_time";`)
}
