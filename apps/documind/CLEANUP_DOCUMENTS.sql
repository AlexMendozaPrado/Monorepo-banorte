-- Clean up ALL documents to start fresh
-- This will delete all documents from the database

-- WARNING: This will delete ALL your documents!
-- Only run this if you want to start completely fresh

-- 1. See what we have first
SELECT
  parent_document_id,
  COUNT(*) as chunk_count,
  MIN(created_at) as first_upload,
  MAX(created_at) as last_upload
FROM documents
WHERE parent_document_id IS NOT NULL
GROUP BY parent_document_id
ORDER BY last_upload DESC;

-- 2. Count total documents
SELECT COUNT(*) as total_documents FROM documents;

-- 3. UNCOMMENT THIS LINE TO DELETE ALL DOCUMENTS
-- DELETE FROM documents;

-- 4. Verify deletion
-- SELECT COUNT(*) as remaining_documents FROM documents;

-- ===================================================
-- Alternative: Keep only the LATEST upload
-- ===================================================

-- This keeps only documents from the most recent parent_document_id
/*
DELETE FROM documents
WHERE parent_document_id NOT IN (
  SELECT parent_document_id
  FROM documents
  WHERE parent_document_id IS NOT NULL
  GROUP BY parent_document_id
  ORDER BY MAX(created_at) DESC
  LIMIT 1
);
*/
