-- DB-01/02: add FKs + indexes on order_items/cart_items → products,
-- plus product snapshot columns on order_items.
--
-- Written to be SAFE on live production data:
--   * snapshot columns are nullable and backfilled from products
--   * orphan cart_items (product no longer exists) are removed BEFORE the FK
--   * FKs are added NOT VALID first, then VALIDATE (avoids long ACCESS EXCLUSIVE locks)
--   * orphan order_items would block the FK — we surface them instead of deleting
--     (order history must never be silently destroyed)
--
-- Review the RAISE NOTICE output. If orphan order_items exist, decide how to
-- resolve them (usually: restore/undelete the product) before re-running.

-- ── 1. Snapshot columns on order_items (nullable, backfilled) ──────────
ALTER TABLE "commerce"."order_items" ADD COLUMN IF NOT EXISTS "product_title"     VARCHAR(500);
ALTER TABLE "commerce"."order_items" ADD COLUMN IF NOT EXISTS "product_sku"       VARCHAR(50);
ALTER TABLE "commerce"."order_items" ADD COLUMN IF NOT EXISTS "product_image_url" VARCHAR(1000);

UPDATE "commerce"."order_items" oi
SET "product_title"     = p."title",
    "product_sku"       = p."variant_id",
    "product_image_url" = p."image_url"
FROM "product"."products" p
WHERE oi."product_id" = p."id"
  AND oi."product_title" IS NULL;

-- ── 2. Indexes on product_id (idempotent) ─────────────────────────────
CREATE INDEX IF NOT EXISTS "order_items_product_id_idx" ON "commerce"."order_items" ("product_id");
CREATE INDEX IF NOT EXISTS "cart_items_product_id_idx"  ON "commerce"."cart_items"  ("product_id");

-- ── 3. Remove orphan cart_items (safe — carts are transient) ───────────
DELETE FROM "commerce"."cart_items" ci
WHERE NOT EXISTS (SELECT 1 FROM "product"."products" p WHERE p."id" = ci."product_id");

-- ── 4. Guard: orphan order_items must be resolved manually ─────────────
DO $$
DECLARE orphan_count integer;
BEGIN
  SELECT count(*) INTO orphan_count
  FROM "commerce"."order_items" oi
  WHERE NOT EXISTS (SELECT 1 FROM "product"."products" p WHERE p."id" = oi."product_id");

  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'Found % orphan order_items referencing missing products. Restore those products (or reassign) before adding the FK — order history must not be deleted.', orphan_count;
  END IF;
END $$;

-- ── 5. Foreign keys (NOT VALID then VALIDATE to minimise locking) ──────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'order_items_product_id_fkey'
  ) THEN
    ALTER TABLE "commerce"."order_items"
      ADD CONSTRAINT "order_items_product_id_fkey"
      FOREIGN KEY ("product_id") REFERENCES "product"."products"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE NOT VALID;
    ALTER TABLE "commerce"."order_items" VALIDATE CONSTRAINT "order_items_product_id_fkey";
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cart_items_product_id_fkey'
  ) THEN
    ALTER TABLE "commerce"."cart_items"
      ADD CONSTRAINT "cart_items_product_id_fkey"
      FOREIGN KEY ("product_id") REFERENCES "product"."products"("id")
      ON DELETE CASCADE ON UPDATE CASCADE NOT VALID;
    ALTER TABLE "commerce"."cart_items" VALIDATE CONSTRAINT "cart_items_product_id_fkey";
  END IF;
END $$;
