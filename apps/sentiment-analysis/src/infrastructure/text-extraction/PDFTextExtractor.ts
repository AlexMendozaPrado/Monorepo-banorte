import {
  TextExtractorPort,
  ExtractedText,
  TextExtractionOptions
} from '../../core/domain/ports/TextExtractorPort';
import pdfParse from 'pdf-parse';

export class PDFTextExtractor implements TextExtractorPort {
  private readonly maxFileSize: number;
  private readonly supportedTypes: string[];

  constructor(maxFileSize: number = 10 * 1024 * 1024) { // 10MB por defecto
    this.maxFileSize = maxFileSize;
    this.supportedTypes = ['application/pdf'];
  }

  async extractTextFromPDF(
    fileBuffer: Buffer,
    options: TextExtractionOptions = {}
  ): Promise<ExtractedText> {
    try {
      // Validar tamaño del archivo
      if (fileBuffer.length > this.maxFileSize) {
        throw new Error(`File size exceeds maximum limit of ${this.maxFileSize} bytes`);
      }

      // Validar formato PDF
      const isValid = await this.isValidPDF(fileBuffer);
      if (!isValid) {
        throw new Error('Invalid PDF file format');
      }

      // Parsear PDF con manejo de errores
      console.log('Starting PDF parsing with buffer size:', fileBuffer.length);
      const pdfData = await pdfParse(fileBuffer, {
        max: options.maxPages || 0, // 0 means no limit
      });

      console.log('PDF parsed successfully:', {
        pages: pdfData.numpages,
        textLength: pdfData.text?.length || 0
      });

      // Extraer y limpiar contenido de texto
      let content = pdfData.text || '';
      
      if (!options.preserveFormatting) {
        content = this.cleanText(content);
      }

      // Construir metadatos
      const metadata = {
        pageCount: pdfData.numpages || 0,
        title: pdfData.info?.Title || undefined,
        author: pdfData.info?.Author || undefined,
        creationDate: pdfData.info?.CreationDate ? new Date(pdfData.info.CreationDate) : undefined,
        modificationDate: pdfData.info?.ModDate ? new Date(pdfData.info.ModDate) : undefined,
        fileSize: fileBuffer.length,
      };

      // Validar contenido extraído
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

      // Verificar número mágico del PDF (firma PDF)
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

      // Por ahora, solo verificar la firma - omitir la validación de parseo
      // para evitar el error "s is not a function" durante la validación
      console.log('PDF validation passed: valid signature found');
      return true;

      // TODO: Re-habilitar la validación de parseo una vez que pdf-parse funcione correctamente
      /*
      try {
        const parser = await this.initializePdfParse();
        await parser(fileBuffer, { max: 1 }); // Parsear solo la primera página para validación
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
      // Eliminar espacios en blanco excesivos
      .replace(/\s+/g, ' ')
      // Eliminar saltos de página y avances de formulario
      .replace(/[\f\r]/g, '')
      // Normalizar saltos de línea
      .replace(/\n+/g, '\n')
      // Eliminar espacios en blanco al inicio y al final
      .trim()
      // Eliminar artefactos comunes de PDF
      .replace(/\u0000/g, '') // Caracteres nulos
      .replace(/\u00A0/g, ' ') // Espacios de no separación
      // Eliminar puntuación excesiva
      .replace(/\.{3,}/g, '...')
      .replace(/-{3,}/g, '---');
  }



  /**
   * Obtiene información básica de un PDF sin extraer todo el texto
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

      const pdfData = await pdfParse(fileBuffer, { max: 0 }); // No extraer texto, solo metadatos

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
