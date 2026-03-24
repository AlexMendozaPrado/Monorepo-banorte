import {
  TextExtractorPort,
  ExtractedText,
  TextExtractionOptions
} from '../../core/domain/ports/TextExtractorPort';
import { createMockExtractedText, TEST_TEXT_CONTENT } from './testData';

/**
 * Implementación mock de TextExtractorPort para testing.
 * Simula la extracción de texto de un PDF sin usar la librería real (pdf-parse).
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
    // Simula fallo de extracción
    if (this.shouldFail) {
      throw new Error('Failed to extract text from PDF');
    }

    // Devuelve el texto configurado o uno por defecto
    if (this.mockExtractedText) {
      return this.mockExtractedText;
    }

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

  // ─── Métodos de utilidad para tests ─────────────────────────
  /** Controla si el PDF se considera válido o no */
  setValidPDF(valid: boolean): void {
    this.validPDF = valid;
  }

  /** Fuerza que el mock lance un error */
  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  /** Define el texto extraído que devolverá */
  setMockExtractedText(text: ExtractedText): void {
    this.mockExtractedText = text;
  }

  /** Cambia el tamaño máximo de archivo permitido */
  setMaxFileSize(size: number): void {
    this.maxFileSize = size;
  }

  /** Limpia todo el estado — se llama en afterEach() */
  reset(): void {
    this.validPDF = true;
    this.shouldFail = false;
    this.mockExtractedText = null;
    this.maxFileSize = 10 * 1024 * 1024;
  }
}

/**
 * Factory para crear un mock ya configurado
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
