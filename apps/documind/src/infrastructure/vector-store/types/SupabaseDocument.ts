/**
 * Type definitions for Supabase documents table
 * Maps to the database schema created in the migration
 */
export interface SupabaseDocument {
  id: string;
  title: string;
  content: string;
  embedding: number[] | string; // Can be array or pgvector string format
  metadata: Record<string, any>;
  chunk_index: number;
  parent_document_id: string | null;
  file_name: string | null;
  file_size: number | null;
  mime_type: string;
  created_at: string;
  updated_at: string;
}

/**
 * Insert type for Supabase documents
 * Omits auto-generated fields
 */
export interface SupabaseDocumentInsert {
  id?: string;
  title: string;
  content: string;
  embedding: number[] | string;
  metadata?: Record<string, any>;
  chunk_index?: number;
  parent_document_id?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  mime_type?: string;
}

/**
 * Result from Supabase match_documents function
 */
export interface SupabaseMatchResult extends SupabaseDocument {
  similarity: number;
}
