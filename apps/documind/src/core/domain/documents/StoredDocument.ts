/**
 * Represents a stored document in the system
 * This is a pure domain entity for tracking uploaded documents
 */
export interface StoredDocument {
  /** Unique identifier for the document */
  id: string;

  /** Original file name */
  fileName: string;

  /** File size in bytes */
  fileSize: number;

  /** MIME type of the document */
  mimeType: string;

  /** Title extracted or provided for the document */
  title: string;

  /** Full extracted text content */
  fullText: string;

  /** Number of chunks this document was split into */
  chunkCount: number;

  /** Document metadata */
  metadata: {
    /** Number of pages (for PDFs) */
    pageCount?: number;

    /** Language of the document */
    language?: string;

    /** Document type (generic, legal, academic, finance) */
    documentType?: string;

    /** Custom fields */
    [key: string]: any;
  };

  /** When the document was uploaded */
  createdAt: Date;

  /** When the document was last updated */
  updatedAt: Date;
}

/**
 * Factory function to create a new StoredDocument
 */
export function createStoredDocument(params: {
  id?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  title: string;
  fullText: string;
  chunkCount: number;
  metadata?: StoredDocument["metadata"];
}): StoredDocument {
  const now = new Date();

  return {
    id: params.id || crypto.randomUUID(),
    fileName: params.fileName,
    fileSize: params.fileSize,
    mimeType: params.mimeType,
    title: params.title,
    fullText: params.fullText,
    chunkCount: params.chunkCount,
    metadata: params.metadata || {},
    createdAt: now,
    updatedAt: now,
  };
}
