-- Debug script to check embeddings in the database

-- 1. Check if documents exist
SELECT COUNT(*) as total_documents FROM documents;

-- 2. Check if embeddings exist (not null)
SELECT
  COUNT(*) as total_docs,
  COUNT(embedding) as docs_with_embeddings,
  COUNT(*) - COUNT(embedding) as docs_without_embeddings
FROM documents;

-- 3. Sample a few documents to see embedding format
SELECT
  id,
  title,
  SUBSTRING(content, 1, 50) as content_preview,
  chunk_index,
  CASE
    WHEN embedding IS NULL THEN 'NULL'
    ELSE 'EXISTS'
  END as embedding_status,
  array_length(embedding::float[], 1) as embedding_dimensions
FROM documents
LIMIT 5;

-- 4. Test the match_documents function with a dummy embedding
-- Create a test embedding (all zeros for testing)
SELECT
  id,
  title,
  similarity
FROM match_documents(
  ARRAY_FILL(0, ARRAY[1536])::vector(1536),
  0.0,  -- threshold 0 to get any result
  5
);

-- 5. Try direct similarity calculation
SELECT
  id,
  title,
  1 - (embedding <=> ARRAY_FILL(0, ARRAY[1536])::vector(1536)) as similarity
FROM documents
WHERE embedding IS NOT NULL
ORDER BY embedding <=> ARRAY_FILL(0, ARRAY[1536])::vector(1536)
LIMIT 5;
