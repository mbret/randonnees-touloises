import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_hero_links_link_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum_pages_hero_links_link_auth_condition" AS ENUM('always', 'loggedIn', 'loggedOut');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum_pages_blocks_cta_links_link_auth_condition" AS ENUM('always', 'loggedIn', 'loggedOut');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum_pages_blocks_content_columns_link_auth_condition" AS ENUM('always', 'loggedIn', 'loggedOut');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum__pages_v_version_hero_links_link_auth_condition" AS ENUM('always', 'loggedIn', 'loggedOut');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_links_link_auth_condition" AS ENUM('always', 'loggedIn', 'loggedOut');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum__pages_v_blocks_content_columns_link_auth_condition" AS ENUM('always', 'loggedIn', 'loggedOut');
  CREATE TYPE "public"."enum_posts_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum__posts_v_version_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum_events_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__events_v_version_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum__events_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum_gallery_media_source" AS ENUM('upload', 'external');
  CREATE TYPE "public"."enum_gallery_external_media_type" AS ENUM('youtube', 'vimeo', 'image', 'other');
  CREATE TYPE "public"."enum_contact_submissions_status" AS ENUM('nouveau', 'traite');
  CREATE TYPE "public"."enum_addresses_country" AS ENUM('US', 'GB', 'CA', 'AU', 'AT', 'BE', 'BR', 'BG', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HK', 'HU', 'IN', 'IE', 'IT', 'JP', 'LV', 'LT', 'LU', 'MY', 'MT', 'MX', 'NL', 'NZ', 'NO', 'PL', 'PT', 'RO', 'SG', 'SK', 'SI', 'ES', 'SE', 'CH');
  CREATE TYPE "public"."enum_variants_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__variants_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_products_blocks_cta_links_link_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum_products_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_products_blocks_cta_links_link_auth_condition" AS ENUM('always', 'loggedIn', 'loggedOut');
  CREATE TYPE "public"."enum_products_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_products_blocks_content_columns_link_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum_products_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum_products_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_products_blocks_content_columns_link_auth_condition" AS ENUM('always', 'loggedIn', 'loggedOut');
  CREATE TYPE "public"."enum_products_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__products_v_blocks_cta_links_link_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum__products_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__products_v_blocks_cta_links_link_auth_condition" AS ENUM('always', 'loggedIn', 'loggedOut');
  CREATE TYPE "public"."enum__products_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__products_v_blocks_content_columns_link_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum__products_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full');
  CREATE TYPE "public"."enum__products_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum__products_v_blocks_content_columns_link_auth_condition" AS ENUM('always', 'loggedIn', 'loggedOut');
  CREATE TYPE "public"."enum__products_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline');
  CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_carts_currency" AS ENUM('USD');
  CREATE TYPE "public"."enum_orders_status" AS ENUM('processing', 'completed', 'cancelled', 'refunded');
  CREATE TYPE "public"."enum_orders_currency" AS ENUM('USD');
  CREATE TYPE "public"."enum_transactions_status" AS ENUM('pending', 'succeeded', 'failed', 'cancelled', 'expired', 'refunded');
  CREATE TYPE "public"."enum_transactions_currency" AS ENUM('USD');
  CREATE TYPE "public"."enum_header_nav_items_link_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum_header_nav_items_link_auth_condition" AS ENUM('always', 'loggedIn', 'loggedOut');
  CREATE TYPE "public"."enum_footer_nav_items_link_visibility" AS ENUM('admin', 'customer');
  CREATE TYPE "public"."enum_footer_nav_items_link_auth_condition" AS ENUM('always', 'loggedIn', 'loggedOut');
  CREATE TYPE "public"."enum_team_directory_team_members_contact_links_type" AS ENUM('email', 'phone', 'whatsapp', 'telegram', 'skype', 'custom');
  CREATE TYPE "public"."enum_team_directory_team_members_social_links_type" AS ENUM('facebook', 'twitter', 'linkedin', 'instagram', 'github', 'youtube', 'custom');
  CREATE TABLE "pages_hero_links_link_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_hero_links_link_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_cta_links_link_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_cta_links_link_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_content_columns_link_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_content_columns_link_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_team_section_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_version_hero_links_link_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_version_hero_links_link_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_cta_links_link_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_cta_links_link_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_content_columns_link_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_content_columns_link_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_team_section_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
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
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"hero_image_id" integer,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"published_at" timestamp(3) with time zone,
  	"require_content_password" boolean,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_events_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer,
  	"categories_id" integer,
  	"users_id" integer
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
  
  CREATE TABLE "_events_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_hero_image_id" integer,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_require_content_password" boolean,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__events_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_events_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"events_id" integer,
  	"categories_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "global_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gallery" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"caption" jsonb,
  	"media_source" "enum_gallery_media_source" DEFAULT 'upload' NOT NULL,
  	"media_id" integer,
  	"external_media_type" "enum_gallery_external_media_type",
  	"external_media_url" varchar,
  	"external_media_alt" varchar,
  	"external_media_caption" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_contact_submissions_status" DEFAULT 'nouveau' NOT NULL,
  	"nom" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"telephone" varchar,
  	"message" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "addresses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"customer_id" integer,
  	"title" varchar,
  	"first_name" varchar,
  	"last_name" varchar,
  	"company" varchar,
  	"address_line1" varchar,
  	"address_line2" varchar,
  	"city" varchar,
  	"state" varchar,
  	"postal_code" varchar,
  	"country" "enum_addresses_country" NOT NULL,
  	"phone" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "variants" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"product_id" integer,
  	"inventory" numeric DEFAULT 0,
  	"price_in_u_s_d_enabled" boolean,
  	"price_in_u_s_d" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_variants_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "variants_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"variant_options_id" integer
  );
  
  CREATE TABLE "_variants_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_product_id" integer,
  	"version_inventory" numeric DEFAULT 0,
  	"version_price_in_u_s_d_enabled" boolean,
  	"version_price_in_u_s_d" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__variants_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_variants_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"variant_options_id" integer
  );
  
  CREATE TABLE "variant_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "variant_options" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_variantoptions_options_order" varchar,
  	"variant_type_id" integer NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "products_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"variant_option_id" integer
  );
  
  CREATE TABLE "products_blocks_cta_links_link_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_products_blocks_cta_links_link_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_products_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_auth_condition" "enum_products_blocks_cta_links_link_auth_condition",
  	"link_is_external" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_products_blocks_cta_links_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "products_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "products_blocks_content_columns_link_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_products_blocks_content_columns_link_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"size" "enum_products_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum_products_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_auth_condition" "enum_products_blocks_content_columns_link_auth_condition",
  	"link_is_external" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum_products_blocks_content_columns_link_appearance" DEFAULT 'default'
  );
  
  CREATE TABLE "products_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "products_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" jsonb,
  	"inventory" numeric DEFAULT 0,
  	"enable_variants" boolean,
  	"price_in_u_s_d_enabled" boolean,
  	"price_in_u_s_d" numeric,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"deleted_at" timestamp(3) with time zone,
  	"_status" "enum_products_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"global_pages_id" integer,
  	"variant_types_id" integer,
  	"products_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "_products_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"variant_option_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_blocks_cta_links_link_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_blocks_cta_links_link_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v_blocks_cta_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__products_v_blocks_cta_links_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_auth_condition" "enum__products_v_blocks_cta_links_link_auth_condition",
  	"link_is_external" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__products_v_blocks_cta_links_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"rich_text" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_products_v_blocks_content_columns_link_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_blocks_content_columns_link_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v_blocks_content_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"size" "enum__products_v_blocks_content_columns_size" DEFAULT 'oneThird',
  	"rich_text" jsonb,
  	"enable_link" boolean,
  	"link_type" "enum__products_v_blocks_content_columns_link_type" DEFAULT 'reference',
  	"link_new_tab" boolean,
  	"link_auth_condition" "enum__products_v_blocks_content_columns_link_auth_condition",
  	"link_is_external" boolean,
  	"link_url" varchar,
  	"link_label" varchar,
  	"link_appearance" "enum__products_v_blocks_content_columns_link_appearance" DEFAULT 'default',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_blocks_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_products_v_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_description" jsonb,
  	"version_inventory" numeric DEFAULT 0,
  	"version_enable_variants" boolean,
  	"version_price_in_u_s_d_enabled" boolean,
  	"version_price_in_u_s_d" numeric,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_generate_slug" boolean DEFAULT true,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version__status" "enum__products_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"posts_id" integer,
  	"global_pages_id" integer,
  	"variant_types_id" integer,
  	"products_id" integer,
  	"categories_id" integer
  );
  
  CREATE TABLE "carts_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"variant_id" integer,
  	"quantity" numeric DEFAULT 1 NOT NULL
  );
  
  CREATE TABLE "carts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"customer_id" integer,
  	"purchased_at" timestamp(3) with time zone,
  	"subtotal" numeric,
  	"currency" "enum_carts_currency" DEFAULT 'USD',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "orders_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"variant_id" integer,
  	"quantity" numeric DEFAULT 1 NOT NULL
  );
  
  CREATE TABLE "orders" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"shipping_address_title" varchar,
  	"shipping_address_first_name" varchar,
  	"shipping_address_last_name" varchar,
  	"shipping_address_company" varchar,
  	"shipping_address_address_line1" varchar,
  	"shipping_address_address_line2" varchar,
  	"shipping_address_city" varchar,
  	"shipping_address_state" varchar,
  	"shipping_address_postal_code" varchar,
  	"shipping_address_country" varchar,
  	"shipping_address_phone" varchar,
  	"customer_id" integer,
  	"customer_email" varchar,
  	"status" "enum_orders_status" DEFAULT 'processing',
  	"amount" numeric,
  	"currency" "enum_orders_currency" DEFAULT 'USD',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "orders_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"transactions_id" integer
  );
  
  CREATE TABLE "transactions_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"product_id" integer,
  	"variant_id" integer,
  	"quantity" numeric DEFAULT 1 NOT NULL
  );
  
  CREATE TABLE "transactions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"billing_address_title" varchar,
  	"billing_address_first_name" varchar,
  	"billing_address_last_name" varchar,
  	"billing_address_company" varchar,
  	"billing_address_address_line1" varchar,
  	"billing_address_address_line2" varchar,
  	"billing_address_city" varchar,
  	"billing_address_state" varchar,
  	"billing_address_postal_code" varchar,
  	"billing_address_country" varchar,
  	"billing_address_phone" varchar,
  	"status" "enum_transactions_status" DEFAULT 'pending' NOT NULL,
  	"customer_id" integer,
  	"customer_email" varchar,
  	"order_id" integer,
  	"cart_id" integer,
  	"amount" numeric,
  	"currency" "enum_transactions_currency" DEFAULT 'USD',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "header_nav_items_link_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_header_nav_items_link_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "footer_nav_items_link_visibility" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_footer_nav_items_link_visibility",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "general" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"content_password" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
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
  
  ALTER TABLE "pages_hero_links" ADD COLUMN "link_auth_condition" "enum_pages_hero_links_link_auth_condition";
  ALTER TABLE "pages_hero_links" ADD COLUMN "link_is_external" boolean;
  ALTER TABLE "pages_blocks_cta_links" ADD COLUMN "link_auth_condition" "enum_pages_blocks_cta_links_link_auth_condition";
  ALTER TABLE "pages_blocks_cta_links" ADD COLUMN "link_is_external" boolean;
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "link_auth_condition" "enum_pages_blocks_content_columns_link_auth_condition";
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "link_is_external" boolean;
  ALTER TABLE "pages_rels" ADD COLUMN "global_pages_id" integer;
  ALTER TABLE "_pages_v_version_hero_links" ADD COLUMN "link_auth_condition" "enum__pages_v_version_hero_links_link_auth_condition";
  ALTER TABLE "_pages_v_version_hero_links" ADD COLUMN "link_is_external" boolean;
  ALTER TABLE "_pages_v_blocks_cta_links" ADD COLUMN "link_auth_condition" "enum__pages_v_blocks_cta_links_link_auth_condition";
  ALTER TABLE "_pages_v_blocks_cta_links" ADD COLUMN "link_is_external" boolean;
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "link_auth_condition" "enum__pages_v_blocks_content_columns_link_auth_condition";
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "link_is_external" boolean;
  ALTER TABLE "_pages_v_rels" ADD COLUMN "global_pages_id" integer;
  ALTER TABLE "redirects_rels" ADD COLUMN "global_pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "global_pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "gallery_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contact_submissions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "addresses_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "variants_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "variant_types_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "variant_options_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "products_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "carts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "orders_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "transactions_id" integer;
  ALTER TABLE "header_nav_items" ADD COLUMN "link_auth_condition" "enum_header_nav_items_link_auth_condition";
  ALTER TABLE "header_nav_items" ADD COLUMN "link_is_external" boolean;
  ALTER TABLE "header_rels" ADD COLUMN "global_pages_id" integer;
  ALTER TABLE "footer_nav_items" ADD COLUMN "link_auth_condition" "enum_footer_nav_items_link_auth_condition";
  ALTER TABLE "footer_nav_items" ADD COLUMN "link_is_external" boolean;
  ALTER TABLE "footer_rels" ADD COLUMN "global_pages_id" integer;
  ALTER TABLE "pages_hero_links_link_visibility" ADD CONSTRAINT "pages_hero_links_link_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_hero_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_links_link_visibility" ADD CONSTRAINT "pages_blocks_cta_links_link_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_cta_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_columns_link_visibility" ADD CONSTRAINT "pages_blocks_content_columns_link_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_section_block" ADD CONSTRAINT "pages_blocks_team_section_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_hero_links_link_visibility" ADD CONSTRAINT "_pages_v_version_hero_links_link_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_version_hero_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_links_link_visibility" ADD CONSTRAINT "_pages_v_blocks_cta_links_link_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_cta_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_columns_link_visibility" ADD CONSTRAINT "_pages_v_blocks_content_columns_link_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_section_block" ADD CONSTRAINT "_pages_v_blocks_team_section_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_visibility" ADD CONSTRAINT "posts_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_visibility" ADD CONSTRAINT "_posts_v_version_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_visibility" ADD CONSTRAINT "events_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_populated_authors" ADD CONSTRAINT "events_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_visibility" ADD CONSTRAINT "_events_v_version_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_version_populated_authors" ADD CONSTRAINT "_events_v_version_populated_authors_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_parent_id_events_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v" ADD CONSTRAINT "_events_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_events_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_events_v_rels" ADD CONSTRAINT "_events_v_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "gallery" ADD CONSTRAINT "gallery_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "addresses" ADD CONSTRAINT "addresses_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "variants_rels" ADD CONSTRAINT "variants_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "variants_rels" ADD CONSTRAINT "variants_rels_variant_options_fk" FOREIGN KEY ("variant_options_id") REFERENCES "public"."variant_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_variants_v" ADD CONSTRAINT "_variants_v_parent_id_variants_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_variants_v" ADD CONSTRAINT "_variants_v_version_product_id_products_id_fk" FOREIGN KEY ("version_product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_variants_v_rels" ADD CONSTRAINT "_variants_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_variants_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_variants_v_rels" ADD CONSTRAINT "_variants_v_rels_variant_options_fk" FOREIGN KEY ("variant_options_id") REFERENCES "public"."variant_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "variant_options" ADD CONSTRAINT "variant_options_variant_type_id_variant_types_id_fk" FOREIGN KEY ("variant_type_id") REFERENCES "public"."variant_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_variant_option_id_variant_options_id_fk" FOREIGN KEY ("variant_option_id") REFERENCES "public"."variant_options"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_gallery" ADD CONSTRAINT "products_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_cta_links_link_visibility" ADD CONSTRAINT "products_blocks_cta_links_link_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products_blocks_cta_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_cta_links" ADD CONSTRAINT "products_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_cta" ADD CONSTRAINT "products_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_content_columns_link_visibility" ADD CONSTRAINT "products_blocks_content_columns_link_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_content_columns" ADD CONSTRAINT "products_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_content" ADD CONSTRAINT "products_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_blocks_media_block" ADD CONSTRAINT "products_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_blocks_media_block" ADD CONSTRAINT "products_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_global_pages_fk" FOREIGN KEY ("global_pages_id") REFERENCES "public"."global_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_variant_types_fk" FOREIGN KEY ("variant_types_id") REFERENCES "public"."variant_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_variant_option_id_variant_options_id_fk" FOREIGN KEY ("variant_option_id") REFERENCES "public"."variant_options"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_gallery" ADD CONSTRAINT "_products_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_cta_links_link_visibility" ADD CONSTRAINT "_products_v_blocks_cta_links_link_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v_blocks_cta_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_cta_links" ADD CONSTRAINT "_products_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_cta" ADD CONSTRAINT "_products_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_content_columns_link_visibility" ADD CONSTRAINT "_products_v_blocks_content_columns_link_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v_blocks_content_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_content_columns" ADD CONSTRAINT "_products_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_content" ADD CONSTRAINT "_products_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_media_block" ADD CONSTRAINT "_products_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_blocks_media_block" ADD CONSTRAINT "_products_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_global_pages_fk" FOREIGN KEY ("global_pages_id") REFERENCES "public"."global_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_variant_types_fk" FOREIGN KEY ("variant_types_id") REFERENCES "public"."variant_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "carts_items" ADD CONSTRAINT "carts_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "carts_items" ADD CONSTRAINT "carts_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "carts_items" ADD CONSTRAINT "carts_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "carts" ADD CONSTRAINT "carts_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "orders_rels" ADD CONSTRAINT "orders_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "orders_rels" ADD CONSTRAINT "orders_rels_transactions_fk" FOREIGN KEY ("transactions_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "transactions_items" ADD CONSTRAINT "transactions_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions_items" ADD CONSTRAINT "transactions_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions_items" ADD CONSTRAINT "transactions_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "transactions" ADD CONSTRAINT "transactions_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_nav_items_link_visibility" ADD CONSTRAINT "header_nav_items_link_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."header_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_nav_items_link_visibility" ADD CONSTRAINT "footer_nav_items_link_visibility_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer_nav_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_directory_team_members_contact_links" ADD CONSTRAINT "team_directory_team_members_contact_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_directory_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_directory_team_members_social_links" ADD CONSTRAINT "team_directory_team_members_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_directory_team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_directory_team_members" ADD CONSTRAINT "team_directory_team_members_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_directory_team_members" ADD CONSTRAINT "team_directory_team_members_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_directory"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_hero_links_link_visibility_order_idx" ON "pages_hero_links_link_visibility" USING btree ("order");
  CREATE INDEX "pages_hero_links_link_visibility_parent_idx" ON "pages_hero_links_link_visibility" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_cta_links_link_visibility_order_idx" ON "pages_blocks_cta_links_link_visibility" USING btree ("order");
  CREATE INDEX "pages_blocks_cta_links_link_visibility_parent_idx" ON "pages_blocks_cta_links_link_visibility" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_content_columns_link_visibility_order_idx" ON "pages_blocks_content_columns_link_visibility" USING btree ("order");
  CREATE INDEX "pages_blocks_content_columns_link_visibility_parent_idx" ON "pages_blocks_content_columns_link_visibility" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_team_section_block_order_idx" ON "pages_blocks_team_section_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_section_block_parent_id_idx" ON "pages_blocks_team_section_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_section_block_path_idx" ON "pages_blocks_team_section_block" USING btree ("_path");
  CREATE INDEX "_pages_v_version_hero_links_link_visibility_order_idx" ON "_pages_v_version_hero_links_link_visibility" USING btree ("order");
  CREATE INDEX "_pages_v_version_hero_links_link_visibility_parent_idx" ON "_pages_v_version_hero_links_link_visibility" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_cta_links_link_visibility_order_idx" ON "_pages_v_blocks_cta_links_link_visibility" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_cta_links_link_visibility_parent_idx" ON "_pages_v_blocks_cta_links_link_visibility" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_content_columns_link_visibility_order_idx" ON "_pages_v_blocks_content_columns_link_visibility" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_content_columns_link_visibility_parent_idx" ON "_pages_v_blocks_content_columns_link_visibility" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_team_section_block_order_idx" ON "_pages_v_blocks_team_section_block" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_team_section_block_parent_id_idx" ON "_pages_v_blocks_team_section_block" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_team_section_block_path_idx" ON "_pages_v_blocks_team_section_block" USING btree ("_path");
  CREATE INDEX "posts_visibility_order_idx" ON "posts_visibility" USING btree ("order");
  CREATE INDEX "posts_visibility_parent_idx" ON "posts_visibility" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_visibility_order_idx" ON "_posts_v_version_visibility" USING btree ("order");
  CREATE INDEX "_posts_v_version_visibility_parent_idx" ON "_posts_v_version_visibility" USING btree ("parent_id");
  CREATE INDEX "events_visibility_order_idx" ON "events_visibility" USING btree ("order");
  CREATE INDEX "events_visibility_parent_idx" ON "events_visibility" USING btree ("parent_id");
  CREATE INDEX "events_populated_authors_order_idx" ON "events_populated_authors" USING btree ("_order");
  CREATE INDEX "events_populated_authors_parent_id_idx" ON "events_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "events_hero_image_idx" ON "events" USING btree ("hero_image_id");
  CREATE INDEX "events_meta_meta_image_idx" ON "events" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE INDEX "events__status_idx" ON "events" USING btree ("_status");
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_events_id_idx" ON "events_rels" USING btree ("events_id");
  CREATE INDEX "events_rels_categories_id_idx" ON "events_rels" USING btree ("categories_id");
  CREATE INDEX "events_rels_users_id_idx" ON "events_rels" USING btree ("users_id");
  CREATE INDEX "_events_v_version_visibility_order_idx" ON "_events_v_version_visibility" USING btree ("order");
  CREATE INDEX "_events_v_version_visibility_parent_idx" ON "_events_v_version_visibility" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_populated_authors_order_idx" ON "_events_v_version_populated_authors" USING btree ("_order");
  CREATE INDEX "_events_v_version_populated_authors_parent_id_idx" ON "_events_v_version_populated_authors" USING btree ("_parent_id");
  CREATE INDEX "_events_v_parent_idx" ON "_events_v" USING btree ("parent_id");
  CREATE INDEX "_events_v_version_version_hero_image_idx" ON "_events_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_events_v_version_meta_version_meta_image_idx" ON "_events_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_events_v_version_version_slug_idx" ON "_events_v" USING btree ("version_slug");
  CREATE INDEX "_events_v_version_version_updated_at_idx" ON "_events_v" USING btree ("version_updated_at");
  CREATE INDEX "_events_v_version_version_created_at_idx" ON "_events_v" USING btree ("version_created_at");
  CREATE INDEX "_events_v_version_version__status_idx" ON "_events_v" USING btree ("version__status");
  CREATE INDEX "_events_v_created_at_idx" ON "_events_v" USING btree ("created_at");
  CREATE INDEX "_events_v_updated_at_idx" ON "_events_v" USING btree ("updated_at");
  CREATE INDEX "_events_v_latest_idx" ON "_events_v" USING btree ("latest");
  CREATE INDEX "_events_v_autosave_idx" ON "_events_v" USING btree ("autosave");
  CREATE INDEX "_events_v_rels_order_idx" ON "_events_v_rels" USING btree ("order");
  CREATE INDEX "_events_v_rels_parent_idx" ON "_events_v_rels" USING btree ("parent_id");
  CREATE INDEX "_events_v_rels_path_idx" ON "_events_v_rels" USING btree ("path");
  CREATE INDEX "_events_v_rels_events_id_idx" ON "_events_v_rels" USING btree ("events_id");
  CREATE INDEX "_events_v_rels_categories_id_idx" ON "_events_v_rels" USING btree ("categories_id");
  CREATE INDEX "_events_v_rels_users_id_idx" ON "_events_v_rels" USING btree ("users_id");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "global_pages_updated_at_idx" ON "global_pages" USING btree ("updated_at");
  CREATE INDEX "global_pages_created_at_idx" ON "global_pages" USING btree ("created_at");
  CREATE INDEX "gallery_media_idx" ON "gallery" USING btree ("media_id");
  CREATE INDEX "gallery_updated_at_idx" ON "gallery" USING btree ("updated_at");
  CREATE INDEX "gallery_created_at_idx" ON "gallery" USING btree ("created_at");
  CREATE INDEX "contact_submissions_updated_at_idx" ON "contact_submissions" USING btree ("updated_at");
  CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");
  CREATE INDEX "addresses_customer_idx" ON "addresses" USING btree ("customer_id");
  CREATE INDEX "addresses_updated_at_idx" ON "addresses" USING btree ("updated_at");
  CREATE INDEX "addresses_created_at_idx" ON "addresses" USING btree ("created_at");
  CREATE INDEX "variants_product_idx" ON "variants" USING btree ("product_id");
  CREATE INDEX "variants_updated_at_idx" ON "variants" USING btree ("updated_at");
  CREATE INDEX "variants_created_at_idx" ON "variants" USING btree ("created_at");
  CREATE INDEX "variants_deleted_at_idx" ON "variants" USING btree ("deleted_at");
  CREATE INDEX "variants__status_idx" ON "variants" USING btree ("_status");
  CREATE INDEX "variants_rels_order_idx" ON "variants_rels" USING btree ("order");
  CREATE INDEX "variants_rels_parent_idx" ON "variants_rels" USING btree ("parent_id");
  CREATE INDEX "variants_rels_path_idx" ON "variants_rels" USING btree ("path");
  CREATE INDEX "variants_rels_variant_options_id_idx" ON "variants_rels" USING btree ("variant_options_id");
  CREATE INDEX "_variants_v_parent_idx" ON "_variants_v" USING btree ("parent_id");
  CREATE INDEX "_variants_v_version_version_product_idx" ON "_variants_v" USING btree ("version_product_id");
  CREATE INDEX "_variants_v_version_version_updated_at_idx" ON "_variants_v" USING btree ("version_updated_at");
  CREATE INDEX "_variants_v_version_version_created_at_idx" ON "_variants_v" USING btree ("version_created_at");
  CREATE INDEX "_variants_v_version_version_deleted_at_idx" ON "_variants_v" USING btree ("version_deleted_at");
  CREATE INDEX "_variants_v_version_version__status_idx" ON "_variants_v" USING btree ("version__status");
  CREATE INDEX "_variants_v_created_at_idx" ON "_variants_v" USING btree ("created_at");
  CREATE INDEX "_variants_v_updated_at_idx" ON "_variants_v" USING btree ("updated_at");
  CREATE INDEX "_variants_v_latest_idx" ON "_variants_v" USING btree ("latest");
  CREATE INDEX "_variants_v_autosave_idx" ON "_variants_v" USING btree ("autosave");
  CREATE INDEX "_variants_v_rels_order_idx" ON "_variants_v_rels" USING btree ("order");
  CREATE INDEX "_variants_v_rels_parent_idx" ON "_variants_v_rels" USING btree ("parent_id");
  CREATE INDEX "_variants_v_rels_path_idx" ON "_variants_v_rels" USING btree ("path");
  CREATE INDEX "_variants_v_rels_variant_options_id_idx" ON "_variants_v_rels" USING btree ("variant_options_id");
  CREATE INDEX "variant_types_updated_at_idx" ON "variant_types" USING btree ("updated_at");
  CREATE INDEX "variant_types_created_at_idx" ON "variant_types" USING btree ("created_at");
  CREATE INDEX "variant_types_deleted_at_idx" ON "variant_types" USING btree ("deleted_at");
  CREATE INDEX "variant_options__variantoptions_options_order_idx" ON "variant_options" USING btree ("_variantoptions_options_order");
  CREATE INDEX "variant_options_variant_type_idx" ON "variant_options" USING btree ("variant_type_id");
  CREATE INDEX "variant_options_updated_at_idx" ON "variant_options" USING btree ("updated_at");
  CREATE INDEX "variant_options_created_at_idx" ON "variant_options" USING btree ("created_at");
  CREATE INDEX "variant_options_deleted_at_idx" ON "variant_options" USING btree ("deleted_at");
  CREATE INDEX "products_gallery_order_idx" ON "products_gallery" USING btree ("_order");
  CREATE INDEX "products_gallery_parent_id_idx" ON "products_gallery" USING btree ("_parent_id");
  CREATE INDEX "products_gallery_image_idx" ON "products_gallery" USING btree ("image_id");
  CREATE INDEX "products_gallery_variant_option_idx" ON "products_gallery" USING btree ("variant_option_id");
  CREATE INDEX "products_blocks_cta_links_link_visibility_order_idx" ON "products_blocks_cta_links_link_visibility" USING btree ("order");
  CREATE INDEX "products_blocks_cta_links_link_visibility_parent_idx" ON "products_blocks_cta_links_link_visibility" USING btree ("parent_id");
  CREATE INDEX "products_blocks_cta_links_order_idx" ON "products_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "products_blocks_cta_links_parent_id_idx" ON "products_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "products_blocks_cta_order_idx" ON "products_blocks_cta" USING btree ("_order");
  CREATE INDEX "products_blocks_cta_parent_id_idx" ON "products_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "products_blocks_cta_path_idx" ON "products_blocks_cta" USING btree ("_path");
  CREATE INDEX "products_blocks_content_columns_link_visibility_order_idx" ON "products_blocks_content_columns_link_visibility" USING btree ("order");
  CREATE INDEX "products_blocks_content_columns_link_visibility_parent_idx" ON "products_blocks_content_columns_link_visibility" USING btree ("parent_id");
  CREATE INDEX "products_blocks_content_columns_order_idx" ON "products_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "products_blocks_content_columns_parent_id_idx" ON "products_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "products_blocks_content_order_idx" ON "products_blocks_content" USING btree ("_order");
  CREATE INDEX "products_blocks_content_parent_id_idx" ON "products_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "products_blocks_content_path_idx" ON "products_blocks_content" USING btree ("_path");
  CREATE INDEX "products_blocks_media_block_order_idx" ON "products_blocks_media_block" USING btree ("_order");
  CREATE INDEX "products_blocks_media_block_parent_id_idx" ON "products_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "products_blocks_media_block_path_idx" ON "products_blocks_media_block" USING btree ("_path");
  CREATE INDEX "products_blocks_media_block_media_idx" ON "products_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "products_meta_meta_image_idx" ON "products" USING btree ("meta_image_id");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products_deleted_at_idx" ON "products" USING btree ("deleted_at");
  CREATE INDEX "products__status_idx" ON "products" USING btree ("_status");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_pages_id_idx" ON "products_rels" USING btree ("pages_id");
  CREATE INDEX "products_rels_posts_id_idx" ON "products_rels" USING btree ("posts_id");
  CREATE INDEX "products_rels_global_pages_id_idx" ON "products_rels" USING btree ("global_pages_id");
  CREATE INDEX "products_rels_variant_types_id_idx" ON "products_rels" USING btree ("variant_types_id");
  CREATE INDEX "products_rels_products_id_idx" ON "products_rels" USING btree ("products_id");
  CREATE INDEX "products_rels_categories_id_idx" ON "products_rels" USING btree ("categories_id");
  CREATE INDEX "_products_v_version_gallery_order_idx" ON "_products_v_version_gallery" USING btree ("_order");
  CREATE INDEX "_products_v_version_gallery_parent_id_idx" ON "_products_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_gallery_image_idx" ON "_products_v_version_gallery" USING btree ("image_id");
  CREATE INDEX "_products_v_version_gallery_variant_option_idx" ON "_products_v_version_gallery" USING btree ("variant_option_id");
  CREATE INDEX "_products_v_blocks_cta_links_link_visibility_order_idx" ON "_products_v_blocks_cta_links_link_visibility" USING btree ("order");
  CREATE INDEX "_products_v_blocks_cta_links_link_visibility_parent_idx" ON "_products_v_blocks_cta_links_link_visibility" USING btree ("parent_id");
  CREATE INDEX "_products_v_blocks_cta_links_order_idx" ON "_products_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX "_products_v_blocks_cta_links_parent_id_idx" ON "_products_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX "_products_v_blocks_cta_order_idx" ON "_products_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_products_v_blocks_cta_parent_id_idx" ON "_products_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_products_v_blocks_cta_path_idx" ON "_products_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_products_v_blocks_content_columns_link_visibility_order_idx" ON "_products_v_blocks_content_columns_link_visibility" USING btree ("order");
  CREATE INDEX "_products_v_blocks_content_columns_link_visibility_parent_idx" ON "_products_v_blocks_content_columns_link_visibility" USING btree ("parent_id");
  CREATE INDEX "_products_v_blocks_content_columns_order_idx" ON "_products_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX "_products_v_blocks_content_columns_parent_id_idx" ON "_products_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX "_products_v_blocks_content_order_idx" ON "_products_v_blocks_content" USING btree ("_order");
  CREATE INDEX "_products_v_blocks_content_parent_id_idx" ON "_products_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX "_products_v_blocks_content_path_idx" ON "_products_v_blocks_content" USING btree ("_path");
  CREATE INDEX "_products_v_blocks_media_block_order_idx" ON "_products_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX "_products_v_blocks_media_block_parent_id_idx" ON "_products_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "_products_v_blocks_media_block_path_idx" ON "_products_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX "_products_v_blocks_media_block_media_idx" ON "_products_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_meta_version_meta_image_idx" ON "_products_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version_deleted_at_idx" ON "_products_v" USING btree ("version_deleted_at");
  CREATE INDEX "_products_v_version_version__status_idx" ON "_products_v" USING btree ("version__status");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX "_products_v_autosave_idx" ON "_products_v" USING btree ("autosave");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_pages_id_idx" ON "_products_v_rels" USING btree ("pages_id");
  CREATE INDEX "_products_v_rels_posts_id_idx" ON "_products_v_rels" USING btree ("posts_id");
  CREATE INDEX "_products_v_rels_global_pages_id_idx" ON "_products_v_rels" USING btree ("global_pages_id");
  CREATE INDEX "_products_v_rels_variant_types_id_idx" ON "_products_v_rels" USING btree ("variant_types_id");
  CREATE INDEX "_products_v_rels_products_id_idx" ON "_products_v_rels" USING btree ("products_id");
  CREATE INDEX "_products_v_rels_categories_id_idx" ON "_products_v_rels" USING btree ("categories_id");
  CREATE INDEX "carts_items_order_idx" ON "carts_items" USING btree ("_order");
  CREATE INDEX "carts_items_parent_id_idx" ON "carts_items" USING btree ("_parent_id");
  CREATE INDEX "carts_items_product_idx" ON "carts_items" USING btree ("product_id");
  CREATE INDEX "carts_items_variant_idx" ON "carts_items" USING btree ("variant_id");
  CREATE INDEX "carts_customer_idx" ON "carts" USING btree ("customer_id");
  CREATE INDEX "carts_updated_at_idx" ON "carts" USING btree ("updated_at");
  CREATE INDEX "carts_created_at_idx" ON "carts" USING btree ("created_at");
  CREATE INDEX "orders_items_order_idx" ON "orders_items" USING btree ("_order");
  CREATE INDEX "orders_items_parent_id_idx" ON "orders_items" USING btree ("_parent_id");
  CREATE INDEX "orders_items_product_idx" ON "orders_items" USING btree ("product_id");
  CREATE INDEX "orders_items_variant_idx" ON "orders_items" USING btree ("variant_id");
  CREATE INDEX "orders_customer_idx" ON "orders" USING btree ("customer_id");
  CREATE INDEX "orders_updated_at_idx" ON "orders" USING btree ("updated_at");
  CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");
  CREATE INDEX "orders_rels_order_idx" ON "orders_rels" USING btree ("order");
  CREATE INDEX "orders_rels_parent_idx" ON "orders_rels" USING btree ("parent_id");
  CREATE INDEX "orders_rels_path_idx" ON "orders_rels" USING btree ("path");
  CREATE INDEX "orders_rels_transactions_id_idx" ON "orders_rels" USING btree ("transactions_id");
  CREATE INDEX "transactions_items_order_idx" ON "transactions_items" USING btree ("_order");
  CREATE INDEX "transactions_items_parent_id_idx" ON "transactions_items" USING btree ("_parent_id");
  CREATE INDEX "transactions_items_product_idx" ON "transactions_items" USING btree ("product_id");
  CREATE INDEX "transactions_items_variant_idx" ON "transactions_items" USING btree ("variant_id");
  CREATE INDEX "transactions_customer_idx" ON "transactions" USING btree ("customer_id");
  CREATE INDEX "transactions_order_idx" ON "transactions" USING btree ("order_id");
  CREATE INDEX "transactions_cart_idx" ON "transactions" USING btree ("cart_id");
  CREATE INDEX "transactions_updated_at_idx" ON "transactions" USING btree ("updated_at");
  CREATE INDEX "transactions_created_at_idx" ON "transactions" USING btree ("created_at");
  CREATE INDEX "header_nav_items_link_visibility_order_idx" ON "header_nav_items_link_visibility" USING btree ("order");
  CREATE INDEX "header_nav_items_link_visibility_parent_idx" ON "header_nav_items_link_visibility" USING btree ("parent_id");
  CREATE INDEX "footer_nav_items_link_visibility_order_idx" ON "footer_nav_items_link_visibility" USING btree ("order");
  CREATE INDEX "footer_nav_items_link_visibility_parent_idx" ON "footer_nav_items_link_visibility" USING btree ("parent_id");
  CREATE INDEX "team_directory_team_members_contact_links_order_idx" ON "team_directory_team_members_contact_links" USING btree ("_order");
  CREATE INDEX "team_directory_team_members_contact_links_parent_id_idx" ON "team_directory_team_members_contact_links" USING btree ("_parent_id");
  CREATE INDEX "team_directory_team_members_social_links_order_idx" ON "team_directory_team_members_social_links" USING btree ("_order");
  CREATE INDEX "team_directory_team_members_social_links_parent_id_idx" ON "team_directory_team_members_social_links" USING btree ("_parent_id");
  CREATE INDEX "team_directory_team_members_order_idx" ON "team_directory_team_members" USING btree ("_order");
  CREATE INDEX "team_directory_team_members_parent_id_idx" ON "team_directory_team_members" USING btree ("_parent_id");
  CREATE INDEX "team_directory_team_members_image_idx" ON "team_directory_team_members" USING btree ("image_id");
  ALTER TABLE "pages_rels" ADD CONSTRAINT "pages_rels_global_pages_fk" FOREIGN KEY ("global_pages_id") REFERENCES "public"."global_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_rels" ADD CONSTRAINT "_pages_v_rels_global_pages_fk" FOREIGN KEY ("global_pages_id") REFERENCES "public"."global_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_global_pages_fk" FOREIGN KEY ("global_pages_id") REFERENCES "public"."global_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_global_pages_fk" FOREIGN KEY ("global_pages_id") REFERENCES "public"."global_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gallery_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk" FOREIGN KEY ("contact_submissions_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_addresses_fk" FOREIGN KEY ("addresses_id") REFERENCES "public"."addresses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_variants_fk" FOREIGN KEY ("variants_id") REFERENCES "public"."variants"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_variant_types_fk" FOREIGN KEY ("variant_types_id") REFERENCES "public"."variant_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_variant_options_fk" FOREIGN KEY ("variant_options_id") REFERENCES "public"."variant_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_carts_fk" FOREIGN KEY ("carts_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_orders_fk" FOREIGN KEY ("orders_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_transactions_fk" FOREIGN KEY ("transactions_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_global_pages_fk" FOREIGN KEY ("global_pages_id") REFERENCES "public"."global_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_global_pages_fk" FOREIGN KEY ("global_pages_id") REFERENCES "public"."global_pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_rels_global_pages_id_idx" ON "pages_rels" USING btree ("global_pages_id");
  CREATE INDEX "_pages_v_rels_global_pages_id_idx" ON "_pages_v_rels" USING btree ("global_pages_id");
  CREATE INDEX "redirects_rels_global_pages_id_idx" ON "redirects_rels" USING btree ("global_pages_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_global_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("global_pages_id");
  CREATE INDEX "payload_locked_documents_rels_gallery_id_idx" ON "payload_locked_documents_rels" USING btree ("gallery_id");
  CREATE INDEX "payload_locked_documents_rels_contact_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_addresses_id_idx" ON "payload_locked_documents_rels" USING btree ("addresses_id");
  CREATE INDEX "payload_locked_documents_rels_variants_id_idx" ON "payload_locked_documents_rels" USING btree ("variants_id");
  CREATE INDEX "payload_locked_documents_rels_variant_types_id_idx" ON "payload_locked_documents_rels" USING btree ("variant_types_id");
  CREATE INDEX "payload_locked_documents_rels_variant_options_id_idx" ON "payload_locked_documents_rels" USING btree ("variant_options_id");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_carts_id_idx" ON "payload_locked_documents_rels" USING btree ("carts_id");
  CREATE INDEX "payload_locked_documents_rels_orders_id_idx" ON "payload_locked_documents_rels" USING btree ("orders_id");
  CREATE INDEX "payload_locked_documents_rels_transactions_id_idx" ON "payload_locked_documents_rels" USING btree ("transactions_id");
  CREATE INDEX "header_rels_global_pages_id_idx" ON "header_rels" USING btree ("global_pages_id");
  CREATE INDEX "footer_rels_global_pages_id_idx" ON "footer_rels" USING btree ("global_pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_hero_links_link_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta_links_link_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_content_columns_link_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_team_section_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_version_hero_links_link_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta_links_link_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_content_columns_link_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_team_section_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "posts_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_version_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_populated_authors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_version_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_version_populated_authors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_events_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "users_roles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "global_pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_submissions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "addresses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "variants" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "variants_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_variants_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_variants_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "variant_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "variant_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_blocks_cta_links_link_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_blocks_cta_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_blocks_content_columns_link_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_blocks_media_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_blocks_cta_links_link_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_blocks_cta_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_blocks_content_columns_link_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_blocks_content_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_blocks_content" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_blocks_media_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "carts_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "carts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "orders_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "transactions_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "transactions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_nav_items_link_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_nav_items_link_visibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "general" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_directory_team_members_contact_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_directory_team_members_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_directory_team_members" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_directory" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_hero_links_link_visibility" CASCADE;
  DROP TABLE "pages_blocks_cta_links_link_visibility" CASCADE;
  DROP TABLE "pages_blocks_content_columns_link_visibility" CASCADE;
  DROP TABLE "pages_blocks_team_section_block" CASCADE;
  DROP TABLE "_pages_v_version_hero_links_link_visibility" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_links_link_visibility" CASCADE;
  DROP TABLE "_pages_v_blocks_content_columns_link_visibility" CASCADE;
  DROP TABLE "_pages_v_blocks_team_section_block" CASCADE;
  DROP TABLE "posts_visibility" CASCADE;
  DROP TABLE "_posts_v_version_visibility" CASCADE;
  DROP TABLE "events_visibility" CASCADE;
  DROP TABLE "events_populated_authors" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "_events_v_version_visibility" CASCADE;
  DROP TABLE "_events_v_version_populated_authors" CASCADE;
  DROP TABLE "_events_v" CASCADE;
  DROP TABLE "_events_v_rels" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "global_pages" CASCADE;
  DROP TABLE "gallery" CASCADE;
  DROP TABLE "contact_submissions" CASCADE;
  DROP TABLE "addresses" CASCADE;
  DROP TABLE "variants" CASCADE;
  DROP TABLE "variants_rels" CASCADE;
  DROP TABLE "_variants_v" CASCADE;
  DROP TABLE "_variants_v_rels" CASCADE;
  DROP TABLE "variant_types" CASCADE;
  DROP TABLE "variant_options" CASCADE;
  DROP TABLE "products_gallery" CASCADE;
  DROP TABLE "products_blocks_cta_links_link_visibility" CASCADE;
  DROP TABLE "products_blocks_cta_links" CASCADE;
  DROP TABLE "products_blocks_cta" CASCADE;
  DROP TABLE "products_blocks_content_columns_link_visibility" CASCADE;
  DROP TABLE "products_blocks_content_columns" CASCADE;
  DROP TABLE "products_blocks_content" CASCADE;
  DROP TABLE "products_blocks_media_block" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "_products_v_version_gallery" CASCADE;
  DROP TABLE "_products_v_blocks_cta_links_link_visibility" CASCADE;
  DROP TABLE "_products_v_blocks_cta_links" CASCADE;
  DROP TABLE "_products_v_blocks_cta" CASCADE;
  DROP TABLE "_products_v_blocks_content_columns_link_visibility" CASCADE;
  DROP TABLE "_products_v_blocks_content_columns" CASCADE;
  DROP TABLE "_products_v_blocks_content" CASCADE;
  DROP TABLE "_products_v_blocks_media_block" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "carts_items" CASCADE;
  DROP TABLE "carts" CASCADE;
  DROP TABLE "orders_items" CASCADE;
  DROP TABLE "orders" CASCADE;
  DROP TABLE "orders_rels" CASCADE;
  DROP TABLE "transactions_items" CASCADE;
  DROP TABLE "transactions" CASCADE;
  DROP TABLE "header_nav_items_link_visibility" CASCADE;
  DROP TABLE "footer_nav_items_link_visibility" CASCADE;
  DROP TABLE "general" CASCADE;
  DROP TABLE "team_directory_team_members_contact_links" CASCADE;
  DROP TABLE "team_directory_team_members_social_links" CASCADE;
  DROP TABLE "team_directory_team_members" CASCADE;
  DROP TABLE "team_directory" CASCADE;
  ALTER TABLE "pages_rels" DROP CONSTRAINT "pages_rels_global_pages_fk";
  
  ALTER TABLE "_pages_v_rels" DROP CONSTRAINT "_pages_v_rels_global_pages_fk";
  
  ALTER TABLE "redirects_rels" DROP CONSTRAINT "redirects_rels_global_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_events_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_global_pages_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_gallery_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_addresses_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_variants_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_variant_types_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_variant_options_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_products_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_carts_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_orders_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_transactions_fk";
  
  ALTER TABLE "header_rels" DROP CONSTRAINT "header_rels_global_pages_fk";
  
  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_global_pages_fk";
  
  DROP INDEX "pages_rels_global_pages_id_idx";
  DROP INDEX "_pages_v_rels_global_pages_id_idx";
  DROP INDEX "redirects_rels_global_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_events_id_idx";
  DROP INDEX "payload_locked_documents_rels_global_pages_id_idx";
  DROP INDEX "payload_locked_documents_rels_gallery_id_idx";
  DROP INDEX "payload_locked_documents_rels_contact_submissions_id_idx";
  DROP INDEX "payload_locked_documents_rels_addresses_id_idx";
  DROP INDEX "payload_locked_documents_rels_variants_id_idx";
  DROP INDEX "payload_locked_documents_rels_variant_types_id_idx";
  DROP INDEX "payload_locked_documents_rels_variant_options_id_idx";
  DROP INDEX "payload_locked_documents_rels_products_id_idx";
  DROP INDEX "payload_locked_documents_rels_carts_id_idx";
  DROP INDEX "payload_locked_documents_rels_orders_id_idx";
  DROP INDEX "payload_locked_documents_rels_transactions_id_idx";
  DROP INDEX "header_rels_global_pages_id_idx";
  DROP INDEX "footer_rels_global_pages_id_idx";
  ALTER TABLE "pages_hero_links" DROP COLUMN "link_auth_condition";
  ALTER TABLE "pages_hero_links" DROP COLUMN "link_is_external";
  ALTER TABLE "pages_blocks_cta_links" DROP COLUMN "link_auth_condition";
  ALTER TABLE "pages_blocks_cta_links" DROP COLUMN "link_is_external";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "link_auth_condition";
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN "link_is_external";
  ALTER TABLE "pages_rels" DROP COLUMN "global_pages_id";
  ALTER TABLE "_pages_v_version_hero_links" DROP COLUMN "link_auth_condition";
  ALTER TABLE "_pages_v_version_hero_links" DROP COLUMN "link_is_external";
  ALTER TABLE "_pages_v_blocks_cta_links" DROP COLUMN "link_auth_condition";
  ALTER TABLE "_pages_v_blocks_cta_links" DROP COLUMN "link_is_external";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "link_auth_condition";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN "link_is_external";
  ALTER TABLE "_pages_v_rels" DROP COLUMN "global_pages_id";
  ALTER TABLE "redirects_rels" DROP COLUMN "global_pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "global_pages_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "gallery_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contact_submissions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "addresses_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "variants_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "variant_types_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "variant_options_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "products_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "carts_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "orders_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "transactions_id";
  ALTER TABLE "header_nav_items" DROP COLUMN "link_auth_condition";
  ALTER TABLE "header_nav_items" DROP COLUMN "link_is_external";
  ALTER TABLE "header_rels" DROP COLUMN "global_pages_id";
  ALTER TABLE "footer_nav_items" DROP COLUMN "link_auth_condition";
  ALTER TABLE "footer_nav_items" DROP COLUMN "link_is_external";
  ALTER TABLE "footer_rels" DROP COLUMN "global_pages_id";
  DROP TYPE "public"."enum_pages_hero_links_link_visibility";
  DROP TYPE "public"."enum_pages_hero_links_link_auth_condition";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_visibility";
  DROP TYPE "public"."enum_pages_blocks_cta_links_link_auth_condition";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_visibility";
  DROP TYPE "public"."enum_pages_blocks_content_columns_link_auth_condition";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_visibility";
  DROP TYPE "public"."enum__pages_v_version_hero_links_link_auth_condition";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_cta_links_link_auth_condition";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_content_columns_link_auth_condition";
  DROP TYPE "public"."enum_posts_visibility";
  DROP TYPE "public"."enum__posts_v_version_visibility";
  DROP TYPE "public"."enum_events_visibility";
  DROP TYPE "public"."enum_events_status";
  DROP TYPE "public"."enum__events_v_version_visibility";
  DROP TYPE "public"."enum__events_v_version_status";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_gallery_media_source";
  DROP TYPE "public"."enum_gallery_external_media_type";
  DROP TYPE "public"."enum_contact_submissions_status";
  DROP TYPE "public"."enum_addresses_country";
  DROP TYPE "public"."enum_variants_status";
  DROP TYPE "public"."enum__variants_v_version_status";
  DROP TYPE "public"."enum_products_blocks_cta_links_link_visibility";
  DROP TYPE "public"."enum_products_blocks_cta_links_link_type";
  DROP TYPE "public"."enum_products_blocks_cta_links_link_auth_condition";
  DROP TYPE "public"."enum_products_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum_products_blocks_content_columns_link_visibility";
  DROP TYPE "public"."enum_products_blocks_content_columns_size";
  DROP TYPE "public"."enum_products_blocks_content_columns_link_type";
  DROP TYPE "public"."enum_products_blocks_content_columns_link_auth_condition";
  DROP TYPE "public"."enum_products_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum_products_status";
  DROP TYPE "public"."enum__products_v_blocks_cta_links_link_visibility";
  DROP TYPE "public"."enum__products_v_blocks_cta_links_link_type";
  DROP TYPE "public"."enum__products_v_blocks_cta_links_link_auth_condition";
  DROP TYPE "public"."enum__products_v_blocks_cta_links_link_appearance";
  DROP TYPE "public"."enum__products_v_blocks_content_columns_link_visibility";
  DROP TYPE "public"."enum__products_v_blocks_content_columns_size";
  DROP TYPE "public"."enum__products_v_blocks_content_columns_link_type";
  DROP TYPE "public"."enum__products_v_blocks_content_columns_link_auth_condition";
  DROP TYPE "public"."enum__products_v_blocks_content_columns_link_appearance";
  DROP TYPE "public"."enum__products_v_version_status";
  DROP TYPE "public"."enum_carts_currency";
  DROP TYPE "public"."enum_orders_status";
  DROP TYPE "public"."enum_orders_currency";
  DROP TYPE "public"."enum_transactions_status";
  DROP TYPE "public"."enum_transactions_currency";
  DROP TYPE "public"."enum_header_nav_items_link_visibility";
  DROP TYPE "public"."enum_header_nav_items_link_auth_condition";
  DROP TYPE "public"."enum_footer_nav_items_link_visibility";
  DROP TYPE "public"."enum_footer_nav_items_link_auth_condition";
  DROP TYPE "public"."enum_team_directory_team_members_contact_links_type";
  DROP TYPE "public"."enum_team_directory_team_members_social_links_type";`)
}
