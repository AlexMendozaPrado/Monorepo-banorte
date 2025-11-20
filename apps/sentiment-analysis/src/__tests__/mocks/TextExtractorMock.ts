import {
  TextExtractorPort,
  ExtractedText,
  TextExtractionOptions
} from '../../core/domain/ports/TextExtractorPort';
import { createMockExtractedText, TEST_TEXT_CONTENT } from './testData';

/**
 * Mock implementation of TextExtractorPort for testing
 */
export class TextExtractorMock implements TextExtractorPort {
  private validPDF: boolean = true;
  private shouldFail: boolean = false;
  private mockExtractedText: ExtractedText | null = null;
  private maxFileSize: number = 10 * 1024 * 1024; // 10MB

  async extractTextFromPDF(
    fileBuffer: Buffer,
    options?: TextExtractionOptions
  ): Promise<ExtractedText> {
    if (this.shouldFail) {
      throw new Error('Failed to extract text from PDF');
    }

    if (this.mockExtractedText) {
      return this.mockExtractedText;
    }

    // Default behavior: return mock extracted text
    return createMockExtractedText(TEST_TEXT_CONTENT);
  }

  async isValidPDF(fileBuffer: Buffer): Promise<boolean> {
    if (this.shouldFail) {
      throw new Error('Failed to validate PDF');
    }
    return this.validPDF;
  }

  getSupportedTypes(): string[] {
    return ['application/pdf'];
  }

  getMaxFileSize(): number {
    return this.maxFileSize;
  }

  // Test utility methods
  setValidPDF(valid: boolean): void {
    this.validPDF = valid;
  }

  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  setMockExtractedText(text: ExtractedText): void {
    this.mockExtractedText = text;
  }

  setMaxFileSize(size: number): void {
    this.maxFileSize = size;
  }

  reset(): void {
    this.validPDF = true;
    this.shouldFail = false;
    this.mockExtractedText = null;
    this.maxFileSize = 10 * 1024 * 1024;
  }
}

/**
 * Factory function to create a configured mock
 */
export const createTextExtractorMock = (config?: {
  validPDF?: boolean;
  shouldFail?: boolean;
  extractedText?: ExtractedText;
  maxFileSize?: number;
}): TextExtractorMock => {
  const mock = new TextExtractorMock();

  if (config?.validPDF !== undefined) {
    mock.setValidPDF(config.validPDF);
  }

  if (config?.shouldFail) {
    mock.setShouldFail(config.shouldFail);
  }

  if (config?.extractedText) {
    mock.setMockExtractedText(config.extractedText);
  }

  if (config?.maxFileSize !== undefined) {
    mock.setMaxFileSize(config.maxFileSize);
  }

  return mock;
};
