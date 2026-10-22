-- Ensure pgvector extension exists
-- Required for product.products.embedding vector(1536) column
-- This migration is idempotent — safe to run on databases that
-- already have the extension (e.g., from init-db.sql)
CREATE EXTENSION IF NOT EXISTS "vector";

-- Verify the extension created successfully
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
  ) THEN
    RAISE NOTICE 'pgvector extension is required but could not be created. Install pgvector first: https://github.com/pgvector/pgvector';
  END IF;
END $$;
