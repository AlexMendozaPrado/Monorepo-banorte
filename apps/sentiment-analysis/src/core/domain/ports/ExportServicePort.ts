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
   * Exports sentiment analyses to the specified format
   * @param analyses Array of sentiment analyses to export
   * @param options Export configuration options
   * @returns Promise with the export result
   */
  exportAnalyses(
    analyses: SentimentAnalysis[],
    options: ExportOptions
  ): Promise<ExportResult>;

  /**
   * Gets the supported export formats
   * @returns Array of supported export formats
   */
  getSupportedFormats(): string[];

  /**
   * Validates export options
   * @param options Export options to validate
   * @returns Promise<boolean> indicating if options are valid
   */
  validateExportOptions(options: ExportOptions): Promise<boolean>;

  /**
   * Gets the maximum number of records that can be exported at once
   * @returns Maximum export limit
   */
  getMaxExportLimit(): number;
}
