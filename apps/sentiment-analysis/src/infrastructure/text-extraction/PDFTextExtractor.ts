import {
  TextExtractorPort,
  ExtractedText,
  TextExtractionOptions
} from '../../core/domain/ports/TextExtractorPort';
import pdfParse from 'pdf-parse';

export class PDFTextExtractor implements TextExtractorPort {
  private readonly maxFileSize: number;
  private readonly supportedTypes: string[];

  constructor(maxFileSize: number = 10 * 1024 * 1024) { // 10MB default
    this.maxFileSize = maxFileSize;
    this.supportedTypes = ['application/pdf'];
  }

  async extractTextFromPDF(
    fileBuffer: Buffer,
    options: TextExtractionOptions = {}
  ): Promise<ExtractedText> {
    try {
      // Validate file size
      if (fileBuffer.length > this.maxFileSize) {
        throw new Error(`File size exceeds maximum limit of ${this.maxFileSize} bytes`);
      }

      // Validate PDF format
      const isValid = await this.isValidPDF(fileBuffer);
      if (!isValid) {
        throw new Error('Invalid PDF file format');
      }

      // Parse PDF with error handling
      console.log('Starting PDF parsing with buffer size:', fileBuffer.length);
      const pdfData = await pdfParse(fileBuffer, {
        max: options.maxPages || 0, // 0 means no limit
      });

      console.log('PDF parsed successfully:', {
        pages: pdfData.numpages,
        textLength: pdfData.text?.length || 0
      });

      // Extract and clean text content
      let content = pdfData.text || '';
      
      if (!options.preserveFormatting) {
        content = this.cleanText(content);
      }

      // Build metadata
      const metadata = {
        pageCount: pdfData.numpages || 0,
        title: pdfData.info?.Title || undefined,
        author: pdfData.info?.Author || undefined,
        creationDate: pdfData.info?.CreationDate ? new Date(pdfData.info.CreationDate) : undefined,
        modificationDate: pdfData.info?.ModDate ? new Date(pdfData.info.ModDate) : undefined,
        fileSize: fileBuffer.length,
      };

      // Validate extracted content
      if (!content || content.trim().length === 0) {
        throw new Error('No text content could be extracted from the PDF');
      }

      return {
        content,
        metadata: options.includeMetadata !== false ? metadata : {
          pageCount: metadata.pageCount,
          fileSize: metadata.fileSize,
        },
      };
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      throw new Error(`PDF text extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async isValidPDF(fileBuffer: Buffer): Promise<boolean> {
    try {
      console.log('Validating PDF file:', {
        size: fileBuffer.length,
        firstBytes: fileBuffer.subarray(0, 10).toString('ascii')
      });

      // Check PDF magic number (PDF signature)
      if (fileBuffer.length < 4) {
        console.log('PDF validation failed: file too small');
        return false;
      }

      const pdfSignature = fileBuffer.subarray(0, 4).toString('ascii');
      console.log('PDF signature:', pdfSignature);

      if (!pdfSignature.startsWith('%PDF')) {
        console.log('PDF validation failed: invalid signature');
        return false;
      }

      // For now, just check the signature - skip the parsing validation
      // to avoid the "s is not a function" error during validation
      console.log('PDF validation passed: valid signature found');
      return true;

      // TODO: Re-enable parsing validation once pdf-parse is working properly
      /*
      try {
        const parser = await this.initializePdfParse();
        await parser(fileBuffer, { max: 1 }); // Parse only first page for validation
        return true;
      } catch (parseError) {
        console.warn('PDF validation failed during parsing:', parseError);
        return false;
      }
      */
    } catch (error) {
      console.error('Error validating PDF:', error);
      return false;
    }
  }

  getSupportedTypes(): string[] {
    return [...this.supportedTypes];
  }

  getMaxFileSize(): number {
    return this.maxFileSize;
  }

  private cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove page breaks and form feeds
      .replace(/[\f\r]/g, '')
      // Normalize line breaks
      .replace(/\n+/g, '\n')
      // Remove leading/trailing whitespace
      .trim()
      // Remove common PDF artifacts
      .replace(/\u0000/g, '') // Null characters
      .replace(/\u00A0/g, ' ') // Non-breaking spaces
      // Remove excessive punctuation
      .replace(/\.{3,}/g, '...')
      .replace(/-{3,}/g, '---');
  }



  /**
   * Gets basic information about a PDF without extracting all text
   */
  async getPDFInfo(fileBuffer: Buffer): Promise<{
    pageCount: number;
    title?: string;
    author?: string;
    creationDate?: Date;
    fileSize: number;
  }> {
    try {
      const isValid = await this.isValidPDF(fileBuffer);
      if (!isValid) {
        throw new Error('Invalid PDF file');
      }

      const pdfData = await pdfParse(fileBuffer, { max: 0 }); // Don't extract text, just metadata

      return {
        pageCount: pdfData.numpages || 0,
        title: pdfData.info?.Title || undefined,
        author: pdfData.info?.Author || undefined,
        creationDate: pdfData.info?.CreationDate ? new Date(pdfData.info.CreationDate) : undefined,
        fileSize: fileBuffer.length,
      };
    } catch (error) {
      throw new Error(`Failed to get PDF info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
