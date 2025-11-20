/**
 * Port (interface) for embedding generation service
 * Follows the Dependency Inversion Principle
 */
export interface EmbeddingOptions {
  /** Model to use for generating embeddings */
  model?: string;

  /** Additional provider-specific options */
  [key: string]: any;
}

export interface EmbeddingResult {
  /** The embedding vector */
  embedding: number[];

  /** Metadata about the embedding */
  metadata: {
    /** Model used */
    model: string;

    /** Dimension of the embedding vector */
    dimensions: number;

    /** Token count (if available) */
    tokenCount?: number;
  };
}

export interface BatchEmbeddingResult {
  /** Array of embeddings */
  embeddings: number[][];

  /** Metadata about the batch operation */
  metadata: {
    /** Model used */
    model: string;

    /** Dimension of the embedding vectors */
    dimensions: number;

    /** Total token count (if available) */
    totalTokens?: number;
  };
}

export interface EmbeddingGeneratorPort {
  /**
   * Generate embedding for a single text
   * @param text - The text to embed
   * @param options - Embedding options
   * @returns Embedding vector with metadata
   */
  generateEmbedding(
    text: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResult>;

  /**
   * Generate embeddings for multiple texts (batch)
   * @param texts - Array of texts to embed
   * @param options - Embedding options
   * @returns Array of embedding vectors with metadata
   */
  generateEmbeddings(
    texts: string[],
    options?: EmbeddingOptions
  ): Promise<BatchEmbeddingResult>;
}
