import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_membership_tiers_tiers_lines_kind" AS ENUM('condition', 'discount', 'requirement');
  CREATE TYPE "public"."enum_pages_blocks_membership_tiers_tiers_link_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum_pages_blocks_membership_tiers_tiers_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_pages_blocks_membership_tiers_tiers_link_auth_condition" AS ENUM('always', 'loggedIn', 'loggedOut');
  CREATE TYPE "public"."enum__pages_v_blocks_membership_tiers_tiers_lines_kind" AS ENUM('condition', 'discount', 'requirement');
  CREATE TYPE "public"."enum__pages_v_blocks_membership_tiers_tiers_link_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum__pages_v_blocks_membership_tiers_tiers_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_membership_tiers_tiers_link_auth_condition" AS ENUM('always', 'loggedIn', 'loggedOut');
  CREATE TABLE "pages_blocks_membership_tiers_tiers_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kind" "enum_pages_blocks_membership_tiers_tiers_lines_kind" DEFAULT 'condition',
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_membership_tiers_tiers_link_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_membership_tiers_tiers_link_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_membership_tiers_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" numeric,
  	"price_note" varchar,
  	"badge" varchar,
  	"link_type" "enum_pages_blocks_membership_tiers_tiers_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_auth_condition" "enum_pages_blocks_membership_tiers_tiers_link_auth_condition",
  	"link_is_external" boolean,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_blocks_membership_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"footnote" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_membership_tiers_tiers_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kind" "enum__pages_v_blocks_membership_tiers_tiers_lines_kind" DEFAULT 'condition',
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_membership_tiers_tiers_link_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_membership_tiers_tiers_link_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_membership_tiers_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"price" numeric,
  	"price_note" varchar,
  	"badge" varchar,
  	"link_type" "enum__pages_v_blocks_membership_tiers_tiers_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_auth_condition" "enum__pages_v_blocks_membership_tiers_tiers_link_auth_condition",
  	"link_is_external" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_membership_tiers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"footnote" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "pages_blocks_membership_tiers_tiers_lines" ADD CONSTRAINT "pages_blocks_membership_tiers_tiers_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_membership_tiers_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_membership_tiers_tiers_link_visibility" ADD CONSTRAINT "pages_blocks_membership_tiers_tiers_link_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_membership_tiers_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_membership_tiers_tiers" ADD CONSTRAINT "pages_blocks_membership_tiers_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_membership_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_membership_tiers" ADD CONSTRAINT "pages_blocks_membership_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_membership_tiers_tiers_lines" ADD CONSTRAINT "_pages_v_blocks_membership_tiers_tiers_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_membership_tiers_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_membership_tiers_tiers_link_visibility" ADD CONSTRAINT "_pages_v_blocks_membership_tiers_tiers_link_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_membership_tiers_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_membership_tiers_tiers" ADD CONSTRAINT "_pages_v_blocks_membership_tiers_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_membership_tiers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_membership_tiers" ADD CONSTRAINT "_pages_v_blocks_membership_tiers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_membership_tiers_tiers_lines_order_idx" ON "pages_blocks_membership_tiers_tiers_lines" USING btree ("_order");
  CREATE INDEX "pages_blocks_membership_tiers_tiers_lines_parent_id_idx" ON "pages_blocks_membership_tiers_tiers_lines" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_membership_tiers_tiers_link_visibility_order_idx" ON "pages_blocks_membership_tiers_tiers_link_visibility" USING btree ("order");
  CREATE INDEX "pages_blocks_membership_tiers_tiers_link_visibility_parent_idx" ON "pages_blocks_membership_tiers_tiers_link_visibility" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_membership_tiers_tiers_order_idx" ON "pages_blocks_membership_tiers_tiers" USING btree ("_order");
  CREATE INDEX "pages_blocks_membership_tiers_tiers_parent_id_idx" ON "pages_blocks_membership_tiers_tiers" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_membership_tiers_order_idx" ON "pages_blocks_membership_tiers" USING btree ("_order");
  CREATE INDEX "pages_blocks_membership_tiers_parent_id_idx" ON "pages_blocks_membership_tiers" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_membership_tiers_path_idx" ON "pages_blocks_membership_tiers" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_membership_tiers_tiers_lines_order_idx" ON "_pages_v_blocks_membership_tiers_tiers_lines" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_membership_tiers_tiers_lines_parent_id_idx" ON "_pages_v_blocks_membership_tiers_tiers_lines" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_membership_tiers_tiers_link_visibility_order_idx" ON "_pages_v_blocks_membership_tiers_tiers_link_visibility" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_membership_tiers_tiers_link_visibility_parent_idx" ON "_pages_v_blocks_membership_tiers_tiers_link_visibility" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_membership_tiers_tiers_order_idx" ON "_pages_v_blocks_membership_tiers_tiers" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_membership_tiers_tiers_parent_id_idx" ON "_pages_v_blocks_membership_tiers_tiers" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_membership_tiers_order_idx" ON "_pages_v_blocks_membership_tiers" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_membership_tiers_parent_id_idx" ON "_pages_v_blocks_membership_tiers" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_membership_tiers_path_idx" ON "_pages_v_blocks_membership_tiers" USING btree ("_path");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_membership_tiers_tiers_lines" CASCADE;
  DROP TABLE "pages_blocks_membership_tiers_tiers_link_visibility" CASCADE;
  DROP TABLE "pages_blocks_membership_tiers_tiers" CASCADE;
  DROP TABLE "pages_blocks_membership_tiers" CASCADE;
  DROP TABLE "_pages_v_blocks_membership_tiers_tiers_lines" CASCADE;
  DROP TABLE "_pages_v_blocks_membership_tiers_tiers_link_visibility" CASCADE;
  DROP TABLE "_pages_v_blocks_membership_tiers_tiers" CASCADE;
  DROP TABLE "_pages_v_blocks_membership_tiers" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_membership_tiers_tiers_lines_kind";
  DROP TYPE "public"."enum_pages_blocks_membership_tiers_tiers_link_visibility";
  DROP TYPE "public"."enum_pages_blocks_membership_tiers_tiers_link_type";
  DROP TYPE "public"."enum_pages_blocks_membership_tiers_tiers_link_auth_condition";
  DROP TYPE "public"."enum__pages_v_blocks_membership_tiers_tiers_lines_kind";
  DROP TYPE "public"."enum__pages_v_blocks_membership_tiers_tiers_link_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_membership_tiers_tiers_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_membership_tiers_tiers_link_auth_condition";`)
}
