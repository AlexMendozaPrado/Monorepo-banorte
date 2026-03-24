import { SentimentAnalysis } from '../entities/SentimentAnalysis';

export interface ExportOptions {
  format: 'csv' | 'json' | 'xlsx';
  includeMetadata?: boolean;
  includeEmotionScores?: boolean;
  dateFormat?: string;
}

export interface ExportResult {
  data: Buffer | string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface ExportServicePort {
  /**
   * Exporta análisis de sentimiento al formato especificado
   * @param analyses Arreglo de análisis de sentimiento a exportar
   * @param options Opciones de configuración de exportación
   * @returns Promesa con el resultado de la exportación
   */
  exportAnalyses(
    analyses: SentimentAnalysis[],
    options: ExportOptions
  ): Promise<ExportResult>;

  /**
   * Obtiene los formatos de exportación soportados
   * @returns Arreglo de formatos de exportación soportados
   */
  getSupportedFormats(): string[];

  /**
   * Valida las opciones de exportación
   * @param options Opciones de exportación a validar
   * @returns Promise<boolean> que indica si las opciones son válidas
   */
  validateExportOptions(options: ExportOptions): Promise<boolean>;

  /**
   * Obtiene el número máximo de registros que se pueden exportar a la vez
   * @returns Límite máximo de exportación
   */
  getMaxExportLimit(): number;
}
