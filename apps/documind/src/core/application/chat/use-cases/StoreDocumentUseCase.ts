import { DocumentChunkerPort } from "@/core/domain/chat/ports/DocumentChunkerPort";
import { EmbeddingGeneratorPort } from "@/core/domain/chat/ports/EmbeddingGeneratorPort";
import { VectorStorePort } from "@/core/domain/chat/ports/VectorStorePort";
import { createStoredDocument, StoredDocument } from "@/core/domain/documents/StoredDocument";

/**
 * Use Case: Store Document with Embeddings
 *
 * This use case orchestrates the process of:
 * 1. Chunking a document into smaller pieces
 * 2. Generating embeddings for each chunk
 * 3. Storing chunks with embeddings in the vector store
 *
 * Follows Clean Architecture principles by depending only on ports (interfaces)
 */
export interface StoreDocumentInput {
  /** Original file name */
  fileName: string;

  /** File size in bytes */
  fileSize: number;

  /** MIME type */
  mimeType: string;

  /** Full text content extracted from the document */
  fullText: string;

  /** Optional title (if not provided, will use fileName) */
  title?: string;

  /** Optional metadata */
  metadata?: Record<string, any>;

  /** Parent document ID (if this is related to another document) */
  parentDocumentId?: string;
}

export interface StoreDocumentOutput {
  /** The stored document metadata */
  document: StoredDocument;

  /** IDs of the stored chunks */
  chunkIds: string[];

  /** Processing statistics */
  stats: {
    /** Number of chunks created */
    chunkCount: number;

    /** Average chunk size */
    averageChunkSize: number;

    /** Total tokens used for embeddings */
    totalTokens?: number;

    /** Time taken in milliseconds */
    timeTaken: number;
  };
}

export class StoreDocumentUseCase {
  constructor(
    private readonly chunker: DocumentChunkerPort,
    private readonly embeddingGenerator: EmbeddingGeneratorPort,
    private readonly vectorStore: VectorStorePort
  ) {}

  async execute(input: StoreDocumentInput): Promise<StoreDocumentOutput> {
    const startTime = Date.now();

    try {
      // Step 1: Chunk the document
      console.log(`[StoreDocumentUseCase] Chunking document: ${input.fileName}`);
      const chunkResult = await this.chunker.chunk(input.fullText);

      if (chunkResult.chunks.length === 0) {
        throw new Error("Document chunking produced no chunks");
      }

      console.log(`[StoreDocumentUseCase] Created ${chunkResult.chunks.length} chunks`);

      // Step 2: Generate embeddings for all chunks (batch operation)
      console.log(`[StoreDocumentUseCase] Generating embeddings...`);
      const embeddingResult = await this.embeddingGenerator.generateEmbeddings(
        chunkResult.chunks
      );

      console.log(
        `[StoreDocumentUseCase] Generated ${embeddingResult.embeddings.length} embeddings`
      );

      // Step 3: Prepare chunks with embeddings for storage
      const parentDocumentId = input.parentDocumentId || crypto.randomUUID();
      const title = input.title || input.fileName;

      const chunksToStore = chunkResult.chunks.map((chunkText, index) => ({
        title: `${title} - Parte ${index + 1}`,
        content: chunkText,
        embedding: embeddingResult.embeddings[index],
        chunkIndex: index,
        parentDocumentId,
        metadata: {
          ...input.metadata,
          fileName: input.fileName,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
        },
      }));

      // Step 4: Store in vector store
      console.log(`[StoreDocumentUseCase] Storing in vector database...`);
      const chunkIds = await this.vectorStore.storeDocuments({
        chunks: chunksToStore,
      });

      console.log(`[StoreDocumentUseCase] Stored ${chunkIds.length} chunks successfully`);

      // Step 5: Create stored document metadata
      const storedDocument = createStoredDocument({
        id: parentDocumentId,
        fileName: input.fileName,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        title,
        fullText: input.fullText,
        chunkCount: chunkResult.metadata.totalChunks,
        metadata: {
          ...input.metadata,
          embeddingModel: embeddingResult.metadata.model,
          embeddingDimensions: embeddingResult.metadata.dimensions,
        },
      });

      const timeTaken = Date.now() - startTime;

      return {
        document: storedDocument,
        chunkIds,
        stats: {
          chunkCount: chunkResult.metadata.totalChunks,
          averageChunkSize: chunkResult.metadata.averageChunkSize,
          totalTokens: embeddingResult.metadata.totalTokens,
          timeTaken,
        },
      };
    } catch (error) {
      console.error("[StoreDocumentUseCase] Error:", error);
      throw new Error(
        `Failed to store document: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
