-- GIN index on Product.attributes JSONB column
-- Enables fast filtering: WHERE attributes @> '{"Класс защиты": "FFP3"}'
-- Critical for brand catalog pages with 10,000+ products
CREATE INDEX IF NOT EXISTS "idx_products_attributes"
  ON "product"."products" USING GIN ("attributes");
