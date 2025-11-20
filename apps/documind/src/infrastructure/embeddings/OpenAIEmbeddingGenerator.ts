import OpenAI from "openai";
import {
  EmbeddingGeneratorPort,
  EmbeddingOptions,
  EmbeddingResult,
  BatchEmbeddingResult,
} from "@/core/domain/chat/ports/EmbeddingGeneratorPort";

/**
 * Implementation of EmbeddingGeneratorPort using OpenAI's Embeddings API
 *
 * Supported Models:
 * - text-embedding-3-small (1536 dimensions, $0.02/1M tokens) - Default
 * - text-embedding-3-large (3072 dimensions, $0.13/1M tokens)
 * - text-embedding-ada-002 (1536 dimensions, legacy)
 *
 * Features:
 * - Supports batch processing (up to 2048 inputs per request)
 * - Max input: 8,191 tokens per text
 * - Optional dimensions parameter to reduce vector size
 *
 * @see https://platform.openai.com/docs/guides/embeddings
 * @see https://platform.openai.com/docs/api-reference/embeddings
 */
export class OpenAIEmbeddingGenerator implements EmbeddingGeneratorPort {
  // OpenAI batch limits
  private static readonly MAX_BATCH_SIZE = 2048;
  private static readonly MAX_INPUT_TOKENS = 8191;

  constructor(
    private readonly openai: OpenAI,
    private readonly defaultModel: string = "text-embedding-3-small"
  ) {}

  /**
   * Generate embedding for a single text
   *
   * @param text - The text to embed (max 8,191 tokens)
   * @param options - Embedding options
   *   - model: Embedding model to use
   *   - dimensions: Output dimensions (only for text-embedding-3-* models)
   * @returns Embedding vector with metadata
   *
   * @throws Error if text exceeds token limit or API call fails
   */
  async generateEmbedding(
    text: string,
    options?: EmbeddingOptions
  ): Promise<EmbeddingResult> {
    const model = options?.model || this.defaultModel;
    const dimensions = options?.dimensions; // Optional: reduce dimensions for storage optimization

    try {
      const response = await this.openai.embeddings.create({
        model,
        input: text,
        ...(dimensions && { dimensions }), // Only include if specified
        encoding_format: "float", // Explicit float format (SDK default)
      });

      const embedding = response.data[0].embedding;
      const actualDimensions = embedding.length;

      return {
        embedding,
        metadata: {
          model,
          dimensions: actualDimensions,
          tokenCount: response.usage?.total_tokens,
        },
      };
    } catch (error) {
      console.error("[OpenAIEmbeddingGenerator] Error generating embedding:", error);
      throw new Error(
        `Failed to generate embedding: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generate embeddings for multiple texts (batch operation)
   *
   * More efficient than calling generateEmbedding multiple times.
   * Automatically splits large batches to respect API limits.
   *
   * @param texts - Array of texts to embed (max 2048 per batch, 8,191 tokens each)
   * @param options - Embedding options
   *   - model: Embedding model to use
   *   - dimensions: Output dimensions (only for text-embedding-3-* models)
   * @returns Array of embedding vectors with metadata
   *
   * @throws Error if API call fails
   */
  async generateEmbeddings(
    texts: string[],
    options?: EmbeddingOptions
  ): Promise<BatchEmbeddingResult> {
    const model = options?.model || this.defaultModel;
    const dimensions = options?.dimensions;

    if (texts.length === 0) {
      return {
        embeddings: [],
        metadata: {
          model,
          dimensions: dimensions || 1536, // Default for text-embedding-3-small
          totalTokens: 0,
        },
      };
    }

    try {
      // Handle large batches by splitting them
      if (texts.length > OpenAIEmbeddingGenerator.MAX_BATCH_SIZE) {
        console.warn(
          `[OpenAIEmbeddingGenerator] Batch size ${texts.length} exceeds limit. Splitting into smaller batches.`
        );
        return await this.generateEmbeddingsInChunks(texts, options);
      }

      // Single batch request
      const response = await this.openai.embeddings.create({
        model,
        input: texts,
        ...(dimensions && { dimensions }),
        encoding_format: "float",
      });

      // Sort by index to maintain order (API may return out of order)
      const sortedData = response.data.sort((a, b) => a.index - b.index);
      const embeddings = sortedData.map((item) => item.embedding);
      const actualDimensions = embeddings[0]?.length || 0;

      return {
        embeddings,
        metadata: {
          model,
          dimensions: actualDimensions,
          totalTokens: response.usage?.total_tokens,
        },
      };
    } catch (error) {
      console.error("[OpenAIEmbeddingGenerator] Error generating batch embeddings:", error);
      throw new Error(
        `Failed to generate embeddings: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Helper method to process large batches in chunks
   * Respects API rate limits by splitting into smaller requests
   */
  private async generateEmbeddingsInChunks(
    texts: string[],
    options?: EmbeddingOptions
  ): Promise<BatchEmbeddingResult> {
    const chunks: string[][] = [];

    // Split into chunks of MAX_BATCH_SIZE
    for (let i = 0; i < texts.length; i += OpenAIEmbeddingGenerator.MAX_BATCH_SIZE) {
      chunks.push(texts.slice(i, i + OpenAIEmbeddingGenerator.MAX_BATCH_SIZE));
    }

    console.log(
      `[OpenAIEmbeddingGenerator] Processing ${texts.length} texts in ${chunks.length} batches`
    );

    // Process all chunks
    const results = await Promise.all(
      chunks.map((chunk) => this.generateEmbeddings(chunk, options))
    );

    // Combine results
    const allEmbeddings = results.flatMap((result) => result.embeddings);
    const totalTokens = results.reduce(
      (sum, result) => sum + (result.metadata.totalTokens || 0),
      0
    );

    return {
      embeddings: allEmbeddings,
      metadata: {
        model: results[0].metadata.model,
        dimensions: results[0].metadata.dimensions,
        totalTokens,
      },
    };
  }
}
