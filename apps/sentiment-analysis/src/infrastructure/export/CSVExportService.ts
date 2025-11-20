import { SentimentAnalysis } from '../../core/domain/entities/SentimentAnalysis';
import { 
  ExportServicePort, 
  ExportOptions, 
  ExportResult 
} from '../../core/domain/ports/ExportServicePort';

export class CSVExportService implements ExportServicePort {
  private readonly maxExportLimit: number;
  private readonly supportedFormats: string[];

  constructor(maxExportLimit: number = 10000) {
    this.maxExportLimit = maxExportLimit;
    this.supportedFormats = ['csv', 'json'];
  }

  async exportAnalyses(
    analyses: SentimentAnalysis[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      if (analyses.length === 0) {
        throw new Error('No analyses provided for export');
      }

      if (analyses.length > this.maxExportLimit) {
        throw new Error(`Export limit exceeded. Maximum ${this.maxExportLimit} records allowed.`);
      }

      let data: Buffer | string;
      let mimeType: string;
      let filename: string;

      switch (options.format) {
        case 'csv':
          data = this.generateCSV(analyses, options);
          mimeType = 'text/csv';
          filename = `sentiment-analysis-${this.getTimestamp()}.csv`;
          break;
        case 'json':
          data = this.generateJSON(analyses, options);
          mimeType = 'application/json';
          filename = `sentiment-analysis-${this.getTimestamp()}.json`;
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      const size = Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data, 'utf8');

      return {
        data: Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8'),
        filename,
        mimeType,
        size,
      };
    } catch (error) {
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getSupportedFormats(): string[] {
    return [...this.supportedFormats];
  }

  async validateExportOptions(options: ExportOptions): Promise<boolean> {
    try {
      // Validate format
      if (!this.supportedFormats.includes(options.format)) {
        return false;
      }

      // Validate date format if provided
      if (options.dateFormat) {
        try {
          const testDate = new Date();
          this.formatDate(testDate, options.dateFormat);
        } catch {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  getMaxExportLimit(): number {
    return this.maxExportLimit;
  }

  private generateCSV(analyses: SentimentAnalysis[], options: ExportOptions): string {
    const headers = this.getCSVHeaders(options);
    const rows = analyses.map(analysis => this.analysisToCSVRow(analysis, options));
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private generateJSON(analyses: SentimentAnalysis[], options: ExportOptions): string {
    const exportData = {
      exportInfo: {
        timestamp: new Date().toISOString(),
        totalRecords: analyses.length,
        format: options.format,
        includeMetadata: options.includeMetadata || false,
        includeEmotionScores: options.includeEmotionScores || false,
      },
      data: analyses.map(analysis => this.analysisToJSONObject(analysis, options)),
    };

    return JSON.stringify(exportData, null, 2);
  }

  private getCSVHeaders(options: ExportOptions): string[] {
    const baseHeaders = [
      'ID',
      'Cliente',
      'Documento',
      'Sentimiento',
      'Confianza',
      'Canal',
      'Fecha de Creación',
    ];

    if (options.includeEmotionScores) {
      baseHeaders.push(
        'Alegría',
        'Tristeza',
        'Enojo',
        'Miedo',
        'Sorpresa',
        'Disgusto'
      );
    }

    if (options.includeMetadata) {
      baseHeaders.push(
        'Palabras',
        'Oraciones',
        'Párrafos',
        'Promedio Palabras/Oración',
        'Puntuación Legibilidad',
        'Tiempo Procesamiento (ms)',
        'Idioma'
      );
    }

    return baseHeaders;
  }

  private analysisToCSVRow(analysis: SentimentAnalysis, options: ExportOptions): string[] {
    const row = [
      this.escapeCSVField(analysis.id),
      this.escapeCSVField(analysis.clientName),
      this.escapeCSVField(analysis.documentName),
      this.escapeCSVField(this.getSentimentDisplayName(analysis.overallSentiment)),
      analysis.confidence.toFixed(3),
      this.escapeCSVField(analysis.channel),
      this.formatDate(analysis.createdAt, options.dateFormat),
    ];

    if (options.includeEmotionScores) {
      row.push(
        analysis.emotionScores.joy.toFixed(3),
        analysis.emotionScores.sadness.toFixed(3),
        analysis.emotionScores.anger.toFixed(3),
        analysis.emotionScores.fear.toFixed(3),
        analysis.emotionScores.surprise.toFixed(3),
        analysis.emotionScores.disgust.toFixed(3)
      );
    }

    if (options.includeMetadata) {
      row.push(
        analysis.analysisMetrics.wordCount.toString(),
        analysis.analysisMetrics.sentenceCount.toString(),
        analysis.analysisMetrics.paragraphCount.toString(),
        analysis.analysisMetrics.averageWordsPerSentence.toFixed(2),
        analysis.analysisMetrics.readabilityScore.toFixed(2),
        analysis.analysisMetrics.processingTimeMs.toString(),
        this.escapeCSVField(analysis.analysisMetrics.languageDetected)
      );
    }

    return row;
  }

  private analysisToJSONObject(analysis: SentimentAnalysis, options: ExportOptions): any {
    const obj: any = {
      id: analysis.id,
      clientName: analysis.clientName,
      documentName: analysis.documentName,
      overallSentiment: analysis.overallSentiment,
      confidence: analysis.confidence,
      channel: analysis.channel,
      createdAt: this.formatDate(analysis.createdAt, options.dateFormat),
      updatedAt: this.formatDate(analysis.updatedAt, options.dateFormat),
    };

    if (options.includeEmotionScores) {
      obj.emotionScores = analysis.emotionScores;
    }

    if (options.includeMetadata) {
      obj.analysisMetrics = analysis.analysisMetrics;
    }

    return obj;
  }

  private escapeCSVField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  private formatDate(date: Date, format?: string): string {
    if (!format) {
      return date.toISOString();
    }

    // Simple date formatting - in production, you might want to use a library like date-fns
    switch (format) {
      case 'YYYY-MM-DD':
        return date.toISOString().split('T')[0];
      case 'DD/MM/YYYY':
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      case 'MM/DD/YYYY':
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
      default:
        return date.toISOString();
    }
  }

  private getSentimentDisplayName(sentiment: any): string {
    switch (sentiment) {
      case 'positive':
        return 'Positivo';
      case 'neutral':
        return 'Neutral';
      case 'negative':
        return 'Negativo';
      default:
        return 'Desconocido';
    }
  }

  private getTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  }
}
