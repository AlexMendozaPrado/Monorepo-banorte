import { SentimentAnalysis } from '../../domain/entities/SentimentAnalysis';
import { 
  SentimentAnalysisRepositoryPort, 
  AnalysisFilter 
} from '../../domain/ports/SentimentAnalysisRepositoryPort';
import { 
  ExportServicePort, 
  ExportOptions, 
  ExportResult 
} from '../../domain/ports/ExportServicePort';

export interface ExportAnalysisCommand {
  filter?: AnalysisFilter;
  exportOptions: ExportOptions;
  maxRecords?: number;
}

export interface ExportAnalysisResult {
  exportResult: ExportResult;
  exportedCount: number;
  totalAvailable: number;
  exportTimestamp: Date;
}

export class ExportAnalysisUseCase {
  constructor(
    private readonly repository: SentimentAnalysisRepositoryPort,
    private readonly exportService: ExportServicePort
  ) {}

  async execute(command: ExportAnalysisCommand): Promise<ExportAnalysisResult> {
    const exportTimestamp = new Date();

    try {
      // Validate export options
      await this.validateExportCommand(command);

      // Determine maximum records to export
      const maxRecords = Math.min(
        command.maxRecords || this.exportService.getMaxExportLimit(),
        this.exportService.getMaxExportLimit()
      );

      // Get analyses to export
      const analysesResult = await this.repository.findAll(
        command.filter,
        {
          page: 1,
          limit: maxRecords,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }
      );

      if (analysesResult.data.length === 0) {
        throw new Error('No analyses found matching the specified criteria.');
      }

      // Export the analyses
      const exportResult = await this.exportService.exportAnalyses(
        analysesResult.data,
        command.exportOptions
      );

      // Log export activity
      console.log('Export completed:', {
        format: command.exportOptions.format,
        recordCount: analysesResult.data.length,
        totalAvailable: analysesResult.total,
        fileSize: exportResult.size,
        timestamp: exportTimestamp.toISOString(),
      });

      return {
        exportResult,
        exportedCount: analysesResult.data.length,
        totalAvailable: analysesResult.total,
        exportTimestamp,
      };
    } catch (error) {
      console.error('Error in ExportAnalysisUseCase:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        command,
        timestamp: exportTimestamp.toISOString(),
      });
      throw error;
    }
  }

  async getExportPreview(filter?: AnalysisFilter, limit: number = 5): Promise<{
    sampleData: SentimentAnalysis[];
    totalCount: number;
    estimatedFileSize: string;
  }> {
    try {
      // Get sample data
      const sampleResult = await this.repository.findAll(filter, {
        page: 1,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      // Estimate file size based on sample
      const avgRecordSize = this.estimateRecordSize(sampleResult.data[0]);
      const estimatedTotalSize = avgRecordSize * sampleResult.total;
      const estimatedFileSize = this.formatFileSize(estimatedTotalSize);

      return {
        sampleData: sampleResult.data,
        totalCount: sampleResult.total,
        estimatedFileSize,
      };
    } catch (error) {
      console.error('Error getting export preview:', error);
      throw error;
    }
  }

  async getSupportedFormats(): Promise<string[]> {
    return this.exportService.getSupportedFormats();
  }

  private async validateExportCommand(command: ExportAnalysisCommand): Promise<void> {
    // Validate export options
    const isValidOptions = await this.exportService.validateExportOptions(command.exportOptions);
    if (!isValidOptions) {
      throw new Error('Invalid export options provided.');
    }

    // Validate max records
    const maxLimit = this.exportService.getMaxExportLimit();
    if (command.maxRecords && command.maxRecords > maxLimit) {
      throw new Error(`Maximum export limit is ${maxLimit} records.`);
    }

    // Validate format
    const supportedFormats = this.exportService.getSupportedFormats();
    if (!supportedFormats.includes(command.exportOptions.format)) {
      throw new Error(`Unsupported export format: ${command.exportOptions.format}. Supported formats: ${supportedFormats.join(', ')}`);
    }
  }

  private estimateRecordSize(analysis: SentimentAnalysis | undefined): number {
    if (!analysis) return 1000; // Default estimate

    // Rough estimation based on JSON serialization
    const jsonString = JSON.stringify(analysis);
    return jsonString.length * 1.2; // Add 20% overhead for CSV/Excel formatting
  }

  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
}
