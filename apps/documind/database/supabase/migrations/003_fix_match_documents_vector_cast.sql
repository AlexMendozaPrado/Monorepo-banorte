-- Fix match_documents to properly cast string to vector type
-- The issue is that query_embedding parameter needs explicit casting

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),  -- Changed parameter type to vector
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  metadata JSONB,
  chunk_index INTEGER,
  parent_document_id UUID,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.title,
    documents.content,
    documents.metadata,
    documents.chunk_index,
    documents.parent_document_id,
    (1 - (documents.embedding <=> query_embedding))::FLOAT AS similarity
  FROM documents
  WHERE documents.embedding IS NOT NULL
    AND (1 - (documents.embedding <=> query_embedding)) >= match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_documents IS 'Performs similarity search on document embeddings using cosine distance. Fixed to properly handle vector type casting.';
