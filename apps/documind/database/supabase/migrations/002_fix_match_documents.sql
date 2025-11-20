-- Fix match_documents function to use >= instead of > for threshold comparison
-- This ensures that results exactly matching the threshold are included

CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.3,  -- Lowered from 0.7 to 0.3 for better results
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
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) >= match_threshold  -- Changed from > to >=
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_documents IS 'Performs similarity search on document embeddings using cosine distance. Returns documents with similarity >= threshold (not just >). Default threshold lowered to 0.3 for better results.';
