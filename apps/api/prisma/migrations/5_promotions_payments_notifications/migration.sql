-- CreateEnum
CREATE TYPE "commerce"."PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded');


-- AlterTable
ALTER TABLE "commerce"."orders" ADD COLUMN     "discount_strategy" VARCHAR(40),
ADD COLUMN     "payment_method" VARCHAR(30),
ADD COLUMN     "payment_status" "commerce"."PaymentStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "promo_code" VARCHAR(40),
ADD COLUMN     "services" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "services_total" DECIMAL(14,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "product"."products" ADD COLUMN     "quality_score" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "commerce"."promotions" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "strategy" VARCHAR(40) NOT NULL,
    "value" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "params" JSONB NOT NULL DEFAULT '{}',
    "min_order_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "usage_limit" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commerce"."payments" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "method" VARCHAR(30) NOT NULL,
    "status" "commerce"."PaymentStatus" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "external_id" VARCHAR(100),
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer"."notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_id" UUID,
    "type" VARCHAR(40) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "channels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promotions_code_key" ON "commerce"."promotions"("code");

-- CreateIndex
CREATE INDEX "promotions_is_active_idx" ON "commerce"."promotions"("is_active");

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "commerce"."payments"("order_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "customer"."notifications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "products_quality_score_idx" ON "product"."products"("quality_score");

-- AddForeignKey
ALTER TABLE "commerce"."payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "commerce"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

