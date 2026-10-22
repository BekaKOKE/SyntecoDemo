-- Synteco Database Initialization
-- Creates extensions and schemas

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "ltree";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "vector";  -- pgvector for AI embeddings

-- Schemas (modular monolith — one schema per domain)
CREATE SCHEMA IF NOT EXISTS product;
CREATE SCHEMA IF NOT EXISTS commerce;
CREATE SCHEMA IF NOT EXISTS customer;
CREATE SCHEMA IF NOT EXISTS crm;
CREATE SCHEMA IF NOT EXISTS inventory;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS import_export;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS audit;

-- Grant
GRANT ALL ON ALL TABLES IN SCHEMA product, commerce, customer, crm, inventory, content, import_export, analytics, audit TO synteco;

-- ltree conversion for category hierarchy (run after Prisma creates the table)
-- Prisma creates product.categories.path as VARCHAR(500); this converts it to native ltree
-- Guards against: missing table, already-converted column, and malformed path data
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'product' AND table_name = 'categories'
      AND column_name = 'path' AND data_type = 'character varying'
  ) THEN
    -- Drop the GiST index if it already exists (clean re-run safety)
    DROP INDEX IF EXISTS product.idx_categories_path_gist;
    -- Validate path data before conversion — replace any invalid ltree chars
    UPDATE product.categories SET path = regexp_replace(path, '[^a-zA-Z0-9_.]', '_', 'g') WHERE path !~ '^[a-zA-Z0-9_.]+$';
    -- Convert to native ltree
    ALTER TABLE product.categories ALTER COLUMN path TYPE ltree USING path::ltree;
    -- Recreate GiST index for hierarchical queries
    CREATE INDEX idx_categories_path_gist ON product.categories USING GIST (path);
    RAISE NOTICE 'ltree conversion complete: categories.path is now ltree with GiST index';
  ELSE
    RAISE NOTICE 'categories.path is already ltree or table does not exist — skipping conversion';
  END IF;
END $$;
