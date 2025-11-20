import { ChatContext, updateRelevantChunks } from "@/core/domain/chat/ChatContext";
import { DocumentChunk } from "@/core/domain/chat/DocumentChunk";

/**
 * Service for assembling and managing chat context
 * This service is part of the Application Layer
 */
export class ContextAssembler {
  /**
   * Assemble context from search results
   * Filters and ranks document chunks based on similarity and relevance
   */
  assembleContext(
    context: ChatContext,
    searchResults: Array<{
      chunk: DocumentChunk;
      similarity: number;
    }>
  ): ChatContext {
    // Update context with new relevant chunks
    // This will automatically filter by similarity threshold and limit
    return updateRelevantChunks(context, searchResults);
  }

  /**
   * Get the most relevant chunks from context
   * Returns chunks sorted by similarity score
   */
  getMostRelevantChunks(
    context: ChatContext,
    limit?: number
  ): Array<{
    chunk: DocumentChunk;
    similarity: number;
  }> {
    const maxChunks = limit || context.config.maxChunks || 5;

    return context.relevantChunks
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxChunks);
  }

  /**
   * Check if context has sufficient relevant documents
   * Returns true if there are relevant documents above the similarity threshold
   */
  hasSufficientContext(context: ChatContext): boolean {
    return context.relevantChunks.length > 0;
  }

  /**
   * Calculate average similarity score of relevant chunks
   * Useful for determining overall context quality
   */
  getAverageSimilarity(context: ChatContext): number {
    if (context.relevantChunks.length === 0) {
      return 0;
    }

    const totalSimilarity = context.relevantChunks.reduce(
      (sum, item) => sum + item.similarity,
      0
    );

    return totalSimilarity / context.relevantChunks.length;
  }

  /**
   * Get context summary statistics
   * Useful for debugging and monitoring
   */
  getContextStats(context: ChatContext): {
    chunkCount: number;
    averageSimilarity: number;
    minSimilarity: number;
    maxSimilarity: number;
    totalContentLength: number;
  } {
    if (context.relevantChunks.length === 0) {
      return {
        chunkCount: 0,
        averageSimilarity: 0,
        minSimilarity: 0,
        maxSimilarity: 0,
        totalContentLength: 0,
      };
    }

    const similarities = context.relevantChunks.map((item) => item.similarity);
    const totalContentLength = context.relevantChunks.reduce(
      (sum, item) => sum + item.chunk.content.length,
      0
    );

    return {
      chunkCount: context.relevantChunks.length,
      averageSimilarity: this.getAverageSimilarity(context),
      minSimilarity: Math.min(...similarities),
      maxSimilarity: Math.max(...similarities),
      totalContentLength,
    };
  }

  /**
   * Filter chunks by minimum similarity threshold
   * Returns only chunks that meet or exceed the threshold
   */
  filterByMinSimilarity(
    chunks: Array<{
      chunk: DocumentChunk;
      similarity: number;
    }>,
    threshold: number
  ): Array<{
    chunk: DocumentChunk;
    similarity: number;
  }> {
    return chunks.filter((item) => item.similarity >= threshold);
  }

  /**
   * Deduplicate chunks by content similarity
   * Removes near-duplicate chunks to avoid redundancy in context
   */
  deduplicateChunks(
    chunks: Array<{
      chunk: DocumentChunk;
      similarity: number;
    }>
  ): Array<{
    chunk: DocumentChunk;
    similarity: number;
  }> {
    const seen = new Set<string>();
    const deduplicated: Array<{
      chunk: DocumentChunk;
      similarity: number;
    }> = [];

    for (const item of chunks) {
      // Use a simple content-based key for deduplication
      // In production, you might want more sophisticated deduplication
      const key = item.chunk.content.substring(0, 100).trim().toLowerCase();

      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
    }

    return deduplicated;
  }
}
