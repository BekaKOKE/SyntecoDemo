-- CreateExtension (must be before vector column usage)
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "audit";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "commerce";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "crm";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "customer";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "import_export";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "product";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "ltree";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "commerce"."OrderStatus" AS ENUM ('pending', 'confirmed', 'processing', 'picking', 'packed', 'shipped', 'delivered', 'cancelled', 'returned');

-- CreateEnum
CREATE TYPE "customer"."UserRole" AS ENUM ('super_admin', 'admin', 'manager', 'customer_admin', 'customer_buyer', 'customer_viewer');

-- CreateEnum
CREATE TYPE "crm"."InquiryStatus" AS ENUM ('new', 'in_progress', 'quoted', 'closed', 'cancelled');

-- CreateEnum
CREATE TYPE "crm"."InquiryPriority" AS ENUM ('high', 'normal', 'low');

-- CreateEnum
CREATE TYPE "crm"."DealStage" AS ENUM ('inquiry', 'qualification', 'quote_sent', 'approval', 'won', 'lost');

-- CreateTable
CREATE TABLE "product"."brands" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "logo_url" VARCHAR(500),
    "website" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "path" VARCHAR(500) NOT NULL,
    "parent_id" UUID,
    "level" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "product_count" INTEGER NOT NULL DEFAULT 0,
    "image_url" VARCHAR(500),
    "meta_title" VARCHAR(200),
    "meta_description" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."category_closure" (
    "ancestor_id" UUID NOT NULL,
    "descendant_id" UUID NOT NULL,
    "depth" INTEGER NOT NULL,

    CONSTRAINT "category_closure_pkey" PRIMARY KEY ("ancestor_id","descendant_id")
);

-- CreateTable
CREATE TABLE "product"."products" (
    "id" UUID NOT NULL,
    "variant_id" VARCHAR(50) NOT NULL,
    "item_id" VARCHAR(50),
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "description_ru" TEXT,
    "brand_id" UUID NOT NULL,
    "image_url" VARCHAR(1000),
    "price" DECIMAL(14,2) NOT NULL,
    "sale_price" DECIMAL(14,2),
    "availability" VARCHAR(20) NOT NULL DEFAULT 'in_stock',
    "group_id" VARCHAR(50),
    "has_variations" BOOLEAN NOT NULL DEFAULT false,
    "mpn" VARCHAR(100),
    "attributes" JSONB NOT NULL DEFAULT '{}',
    "spec_table" JSONB NOT NULL DEFAULT '{}',
    "meta_title" VARCHAR(200),
    "meta_description" VARCHAR(500),
    "embedding" vector(1536),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."product_categories" (
    "product_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("product_id","category_id")
);

-- CreateTable
CREATE TABLE "product"."product_variants" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "option_id" VARCHAR(50),
    "option_name" VARCHAR(500),
    "price" DECIMAL(14,2),
    "in_stock" BOOLEAN NOT NULL DEFAULT true,
    "image_url" VARCHAR(1000),

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."product_images" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "thumb_url" VARCHAR(1000) NOT NULL,
    "alt" VARCHAR(500),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."product_documents" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "type" VARCHAR(20) NOT NULL DEFAULT 'pdf',
    "file_size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."product_prices" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "tier" VARCHAR(30) NOT NULL DEFAULT 'retail',
    "price" DECIMAL(14,2) NOT NULL,
    "min_quantity" INTEGER NOT NULL DEFAULT 1,
    "contract_id" UUID,
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."warehouses" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "address" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product"."product_stock" (
    "product_id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "reorder_point" INTEGER NOT NULL DEFAULT 10,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_stock_pkey" PRIMARY KEY ("product_id","warehouse_id")
);

-- CreateTable
CREATE TABLE "product"."product_specifications" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "value" VARCHAR(500) NOT NULL,
    "unit" VARCHAR(50),
    "group" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_specifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce"."orders" (
    "id" UUID NOT NULL,
    "order_number" VARCHAR(20) NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "commerce"."OrderStatus" NOT NULL DEFAULT 'pending',
    "subtotal" DECIMAL(14,2) NOT NULL,
    "discount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "vat" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce"."order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" VARCHAR(50),
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(14,2) NOT NULL,
    "total_price" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce"."order_status_history" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "from_status" "commerce"."OrderStatus" NOT NULL,
    "to_status" "commerce"."OrderStatus" NOT NULL,
    "actor" VARCHAR(100),
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce"."carts" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "session_id" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce"."cart_items" (
    "id" UUID NOT NULL,
    "cart_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(14,2),
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer"."users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20),
    "role" "customer"."UserRole" NOT NULL DEFAULT 'customer_buyer',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "company_id" UUID,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer"."refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "family_id" VARCHAR(100) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer"."companies" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "bin" VARCHAR(12) NOT NULL,
    "segment" VARCHAR(30) NOT NULL DEFAULT 'small_business',
    "contract_id" UUID,
    "credit_limit" DECIMAL(14,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."inquiries" (
    "id" UUID NOT NULL,
    "inquiry_number" VARCHAR(20) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "contact_name" VARCHAR(100) NOT NULL,
    "contact_phone" VARCHAR(20),
    "contact_email" VARCHAR(255),
    "items" JSONB NOT NULL DEFAULT '[]',
    "item_count" INTEGER NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" "crm"."InquiryStatus" NOT NULL DEFAULT 'new',
    "priority" "crm"."InquiryPriority" NOT NULL DEFAULT 'normal',
    "notes" TEXT,
    "assigned_to" UUID,
    "sla_due_by" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."deals" (
    "id" UUID NOT NULL,
    "deal_number" VARCHAR(20) NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "contact_name" VARCHAR(100),
    "contact_phone" VARCHAR(20),
    "value" DECIMAL(14,2) NOT NULL,
    "stage" "crm"."DealStage" NOT NULL DEFAULT 'inquiry',
    "priority" "crm"."InquiryPriority" NOT NULL DEFAULT 'normal',
    "days_in_stage" INTEGER NOT NULL DEFAULT 0,
    "owner_id" VARCHAR(100),
    "owner_name" VARCHAR(100),
    "hot" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "stage_entered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_export"."import_jobs" (
    "id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "file_name" VARCHAR(500) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "processed_rows" INTEGER NOT NULL DEFAULT 0,
    "failed_rows" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB NOT NULL DEFAULT '[]',
    "result" JSONB,
    "created_by" VARCHAR(100),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit"."audit_logs" (
    "id" UUID NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "user_id" VARCHAR(36),
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "product"."brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "product"."brands"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "product"."categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_path_key" ON "product"."categories"("path");

-- CreateIndex
CREATE INDEX "categories_path_idx" ON "product"."categories"("path");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "product"."categories"("parent_id");

-- CreateIndex
CREATE INDEX "category_closure_descendant_id_idx" ON "product"."category_closure"("descendant_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_variant_id_key" ON "product"."products"("variant_id");

-- CreateIndex
CREATE INDEX "products_brand_id_idx" ON "product"."products"("brand_id");

-- CreateIndex
CREATE INDEX "products_group_id_idx" ON "product"."products"("group_id");

-- CreateIndex
CREATE INDEX "products_mpn_idx" ON "product"."products"("mpn");

-- CreateIndex
CREATE INDEX "products_variant_id_idx" ON "product"."products"("variant_id");

-- CreateIndex
CREATE INDEX "products_title_idx" ON "product"."products"("title");

-- CreateIndex
CREATE INDEX "products_availability_idx" ON "product"."products"("availability");

-- CreateIndex
CREATE UNIQUE INDEX "product_prices_product_id_tier_min_quantity_key" ON "product"."product_prices"("product_id", "tier", "min_quantity");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_code_key" ON "product"."warehouses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "commerce"."orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_user_id_created_at_idx" ON "commerce"."orders"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "commerce"."orders"("status");

-- CreateIndex
CREATE INDEX "order_status_history_order_id_idx" ON "commerce"."order_status_history"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_id_key" ON "commerce"."carts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "carts_session_id_key" ON "commerce"."carts"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_key" ON "commerce"."cart_items"("cart_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "customer"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "customer"."refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "customer"."refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "customer"."refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "companies_bin_key" ON "customer"."companies"("bin");

-- CreateIndex
CREATE UNIQUE INDEX "inquiries_inquiry_number_key" ON "crm"."inquiries"("inquiry_number");

-- CreateIndex
CREATE INDEX "inquiries_status_idx" ON "crm"."inquiries"("status");

-- CreateIndex
CREATE INDEX "inquiries_priority_idx" ON "crm"."inquiries"("priority");

-- CreateIndex
CREATE INDEX "inquiries_created_at_idx" ON "crm"."inquiries"("created_at");

-- CreateIndex
CREATE INDEX "inquiries_assigned_to_idx" ON "crm"."inquiries"("assigned_to");

-- CreateIndex
CREATE UNIQUE INDEX "deals_deal_number_key" ON "crm"."deals"("deal_number");

-- CreateIndex
CREATE INDEX "deals_stage_idx" ON "crm"."deals"("stage");

-- CreateIndex
CREATE INDEX "deals_owner_id_idx" ON "crm"."deals"("owner_id");

-- CreateIndex
CREATE INDEX "deals_created_at_idx" ON "crm"."deals"("created_at");

-- CreateIndex
CREATE INDEX "import_jobs_status_idx" ON "import_export"."import_jobs"("status");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit"."audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit"."audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit"."audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "product"."categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "product"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."category_closure" ADD CONSTRAINT "category_closure_ancestor_id_fkey" FOREIGN KEY ("ancestor_id") REFERENCES "product"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."category_closure" ADD CONSTRAINT "category_closure_descendant_id_fkey" FOREIGN KEY ("descendant_id") REFERENCES "product"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."products" ADD CONSTRAINT "products_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "product"."brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."product_categories" ADD CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."product_categories" ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."product_documents" ADD CONSTRAINT "product_documents_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."product_prices" ADD CONSTRAINT "product_prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."product_stock" ADD CONSTRAINT "product_stock_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."product_stock" ADD CONSTRAINT "product_stock_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "product"."warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product"."product_specifications" ADD CONSTRAINT "product_specifications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce"."order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "commerce"."orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce"."order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "commerce"."orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commerce"."cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "commerce"."carts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "customer"."companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "customer"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

