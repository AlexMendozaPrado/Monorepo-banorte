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
   * Extrae el contenido de texto de un buffer de archivo PDF
   * @param fileBuffer El archivo PDF como buffer
   * @param options Configuración de extracción opcional
   * @returns Promesa con el texto extraído y los metadatos
   */
  extractTextFromPDF(
    fileBuffer: Buffer, 
    options?: TextExtractionOptions
  ): Promise<ExtractedText>;

  /**
   * Valida si el buffer proporcionado es un archivo PDF válido
   * @param fileBuffer El buffer del archivo a validar
   * @returns Promise<boolean> que indica si el archivo es un PDF válido
   */
  isValidPDF(fileBuffer: Buffer): Promise<boolean>;

  /**
   * Obtiene los tipos de archivo soportados
   * @returns Arreglo de tipos MIME soportados
   */
  getSupportedTypes(): string[];

  /**
   * Obtiene el tamaño máximo de archivo soportado
   * @returns Tamaño máximo de archivo en bytes
   */
  getMaxFileSize(): number;
}
