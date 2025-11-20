import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import {
  DocumentChunkerPort,
  ChunkOptions,
  ChunkResult,
} from "@/core/domain/chat/ports/DocumentChunkerPort";

/**
 * Implementation of DocumentChunkerPort using LangChain's RecursiveCharacterTextSplitter
 * This implementation is completely local and doesn't require any external API calls
 */
export class RecursiveTextChunker implements DocumentChunkerPort {
  /**
   * Split a document into chunks using recursive character splitting
   * @param text - The text to split
   * @param options - Chunking options
   * @returns Chunked text with metadata
   */
  async chunk(text: string, options?: ChunkOptions): Promise<ChunkResult> {
    // Validate input text
    if (!text || typeof text !== 'string') {
      throw new Error(`Invalid text input for chunking. Received: ${typeof text}`);
    }

    if (text.trim().length === 0) {
      throw new Error('Cannot chunk empty text');
    }

    const chunkSize = options?.chunkSize || 1000;
    const chunkOverlap = options?.chunkOverlap || 200;
    const separators = options?.separator
      ? [options.separator]
      : ["\n\n", "\n", ". ", " ", ""];

    // Create the text splitter with specified options
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      separators,
      keepSeparator: false,
    });

    // Split the text into chunks
    const chunks = await textSplitter.splitText(text);

    // Calculate metadata
    const totalChunks = chunks.length;
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const averageChunkSize = totalChunks > 0 ? Math.round(totalLength / totalChunks) : 0;

    return {
      chunks,
      metadata: {
        totalChunks,
        averageChunkSize,
        originalLength: text.length,
      },
    };
  }
}
