import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_version_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "search_categories" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts_visibility" CASCADE;
  DROP TABLE "_posts_v_version_visibility" CASCADE;
  DROP TABLE "search_categories" CASCADE;
  ALTER TABLE "posts_rels" DROP CONSTRAINT "posts_rels_categories_fk";
  
  ALTER TABLE "_posts_v_rels" DROP CONSTRAINT "_posts_v_rels_categories_fk";
  
  DROP INDEX "posts_rels_categories_id_idx";
  DROP INDEX "_posts_v_rels_categories_id_idx";
  ALTER TABLE "posts" ADD COLUMN "schedule_start_date" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "schedule_end_date" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_schedule_start_date" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_schedule_end_date" timestamp(3) with time zone;
  CREATE INDEX "posts_schedule_schedule_start_date_idx" ON "posts" USING btree ("schedule_start_date");
  CREATE INDEX "_posts_v_version_schedule_version_schedule_start_date_idx" ON "_posts_v" USING btree ("version_schedule_start_date");
  ALTER TABLE "posts_rels" DROP COLUMN "categories_id";
  ALTER TABLE "_posts_v_rels" DROP COLUMN "categories_id";
  DROP TYPE "public"."enum_posts_visibility";
  DROP TYPE "public"."enum__posts_v_version_visibility";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum__posts_v_version_visibility" AS ENUM('admin', 'customer');
  CREATE TABLE "posts_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_posts_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_posts_v_version_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__posts_v_version_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "search_categories" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"relation_to" varchar,
  	"category_i_d" varchar,
  	"title" varchar
  );
  
  DROP INDEX "posts_schedule_schedule_start_date_idx";
  DROP INDEX "_posts_v_version_schedule_version_schedule_start_date_idx";
  ALTER TABLE "posts_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "_posts_v_rels" ADD COLUMN "categories_id" integer;
  ALTER TABLE "posts_visibility" ADD CONSTRAINT "posts_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_visibility" ADD CONSTRAINT "_posts_v_version_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_categories" ADD CONSTRAINT "search_categories_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_visibility_order_idx" ON "posts_visibility" USING btree ("order");
  CREATE INDEX "posts_visibility_parent_idx" ON "posts_visibility" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_visibility_order_idx" ON "_posts_v_version_visibility" USING btree ("order");
  CREATE INDEX "_posts_v_version_visibility_parent_idx" ON "_posts_v_version_visibility" USING btree ("parent_id");
  CREATE INDEX "search_categories_order_idx" ON "search_categories" USING btree ("_order");
  CREATE INDEX "search_categories_parent_id_idx" ON "search_categories" USING btree ("_parent_id");
  ALTER TABLE "posts_rels" ADD CONSTRAINT "posts_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_rels" ADD CONSTRAINT "_posts_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_rels_categories_id_idx" ON "posts_rels" USING btree ("categories_id");
  CREATE INDEX "_posts_v_rels_categories_id_idx" ON "_posts_v_rels" USING btree ("categories_id");
  ALTER TABLE "posts" DROP COLUMN "schedule_start_date";
  ALTER TABLE "posts" DROP COLUMN "schedule_end_date";
  ALTER TABLE "_posts_v" DROP COLUMN "version_schedule_start_date";
  ALTER TABLE "_posts_v" DROP COLUMN "version_schedule_end_date";`)
}
