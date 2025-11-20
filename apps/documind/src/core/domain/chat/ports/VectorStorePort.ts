import { DocumentChunk } from "../DocumentChunk";

/**
 * Port (interface) for vector store operations
 * Follows the Dependency Inversion Principle
 */
export interface VectorStoreOptions {
  /** Table or collection name */
  tableName?: string;

  /** Additional provider-specific options */
  [key: string]: any;
}

export interface StoreDocumentInput {
  /** Document chunks to store */
  chunks: Array<{
    /** Title of the chunk */
    title: string;

    /** Content of the chunk */
    content: string;

    /** Embedding vector */
    embedding: number[];

    /** Chunk index */
    chunkIndex: number;

    /** Parent document ID */
    parentDocumentId?: string;

    /** Additional metadata */
    metadata?: Record<string, any>;
  }>;
}

export interface SearchOptions {
  /** Maximum number of results to return */
  maxResults?: number;

  /** Minimum similarity threshold (0-1) */
  similarityThreshold?: number;

  /** Filter by parent document ID */
  parentDocumentId?: string;

  /** Additional filters */
  filters?: Record<string, any>;
}

export interface SearchResult {
  /** Matching document chunks */
  chunks: Array<{
    /** The document chunk */
    chunk: DocumentChunk;

    /** Similarity score (0-1) */
    similarity: number;
  }>;

  /** Metadata about the search */
  metadata: {
    /** Total results found (before limit) */
    totalResults: number;

    /** Time taken in milliseconds */
    timeTaken?: number;
  };
}

export interface VectorStorePort {
  /**
   * Store document chunks with embeddings
   * @param input - Document chunks to store
   * @param options - Store options
   * @returns Array of stored document IDs
   */
  storeDocuments(
    input: StoreDocumentInput,
    options?: VectorStoreOptions
  ): Promise<string[]>;

  /**
   * Search for similar documents using vector similarity
   * @param queryEmbedding - Query embedding vector
   * @param options - Search options
   * @returns Matching documents with similarity scores
   */
  searchSimilar(
    queryEmbedding: number[],
    options?: SearchOptions
  ): Promise<SearchResult>;

  /**
   * Delete documents by parent document ID
   * @param parentDocumentId - Parent document ID
   * @returns Number of documents deleted
   */
  deleteByParentId(parentDocumentId: string): Promise<number>;

  /**
   * Get document chunks by parent document ID
   * @param parentDocumentId - Parent document ID
   * @returns Array of document chunks
   */
  getByParentId(parentDocumentId: string): Promise<DocumentChunk[]>;
}
