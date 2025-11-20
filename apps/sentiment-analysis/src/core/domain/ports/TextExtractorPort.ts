export interface ExtractedText {
  content: string;
  metadata: {
    pageCount: number;
    title?: string;
    author?: string;
    creationDate?: Date;
    modificationDate?: Date;
    fileSize: number;
  };
}

export interface TextExtractionOptions {
  maxPages?: number;
  includeMetadata?: boolean;
  preserveFormatting?: boolean;
}

export interface TextExtractorPort {
  /**
   * Extracts text content from a PDF file buffer
   * @param fileBuffer The PDF file as a buffer
   * @param options Optional extraction configuration
   * @returns Promise with the extracted text and metadata
   */
  extractTextFromPDF(
    fileBuffer: Buffer, 
    options?: TextExtractionOptions
  ): Promise<ExtractedText>;

  /**
   * Validates if the provided buffer is a valid PDF file
   * @param fileBuffer The file buffer to validate
   * @returns Promise<boolean> indicating if the file is a valid PDF
   */
  isValidPDF(fileBuffer: Buffer): Promise<boolean>;

  /**
   * Gets the supported file types
   * @returns Array of supported MIME types
   */
  getSupportedTypes(): string[];

  /**
   * Gets the maximum file size supported
   * @returns Maximum file size in bytes
   */
  getMaxFileSize(): number;
}
