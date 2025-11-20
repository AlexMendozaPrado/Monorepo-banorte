/**
 * Represents a chunk of a document with its embedding
 * This is a pure domain entity following Clean Architecture principles
 */
export interface DocumentChunk {
  /** Unique identifier for the chunk */
  id: string;

  /** Title or heading of the chunk */
  title: string;

  /** Text content of the chunk */
  content: string;

  /** Vector embedding of the content (array of numbers) */
  embedding?: number[];

  /** Index of this chunk within the parent document */
  chunkIndex: number;

  /** Reference to the parent document ID */
  parentDocumentId?: string;

  /** Additional metadata about the chunk */
  metadata: {
    /** Original file name */
    fileName?: string;

    /** File size in bytes */
    fileSize?: number;

    /** MIME type */
    mimeType?: string;

    /** Page number in original document */
    pageNumber?: number;

    /** Custom fields */
    [key: string]: any;
  };

  /** When the chunk was created */
  createdAt: Date;

  /** When the chunk was last updated */
  updatedAt: Date;
}

/**
 * Factory function to create a new DocumentChunk
 */
export function createDocumentChunk(params: {
  id?: string;
  title: string;
  content: string;
  embedding?: number[];
  chunkIndex: number;
  parentDocumentId?: string;
  metadata?: DocumentChunk["metadata"];
}): DocumentChunk {
  const now = new Date();

  return {
    id: params.id || crypto.randomUUID(),
    title: params.title,
    content: params.content,
    embedding: params.embedding,
    chunkIndex: params.chunkIndex,
    parentDocumentId: params.parentDocumentId,
    metadata: params.metadata || {},
    createdAt: now,
    updatedAt: now,
  };
}
