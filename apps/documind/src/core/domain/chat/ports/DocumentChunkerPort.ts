/**
 * Port (interface) for document chunking service
 * Follows the Dependency Inversion Principle
 */
export interface ChunkOptions {
  /** Maximum size of each chunk in characters */
  chunkSize?: number;

  /** Number of characters to overlap between chunks */
  chunkOverlap?: number;

  /** Separator to use for splitting (default: "\n\n") */
  separator?: string;
}

export interface ChunkResult {
  /** Array of text chunks */
  chunks: string[];

  /** Metadata about the chunking process */
  metadata: {
    /** Total number of chunks created */
    totalChunks: number;

    /** Average chunk size */
    averageChunkSize: number;

    /** Original text length */
    originalLength: number;
  };
}

export interface DocumentChunkerPort {
  /**
   * Split a document into chunks
   * @param text - The text to split
   * @param options - Chunking options
   * @returns Chunked text with metadata
   */
  chunk(text: string, options?: ChunkOptions): Promise<ChunkResult>;
}
