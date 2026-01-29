import { Capability } from '../entities/Capability';
import { Functionality } from '../entities/Functionality';
import { Project } from '../entities/Project';
import { SearchResult } from '../entities/SearchResult';

/**
 * Puerto (interfaz) para el servicio de exportación
 */
export interface ExportService {
  /**
   * Exporta capacidades a CSV
   */
  exportCapabilitiesToCsv(capabilities: Capability[]): Promise<ExportResult>;

  /**
   * Exporta funcionalidades a CSV
   */
  exportFunctionalitiesToCsv(functionalities: Functionality[]): Promise<ExportResult>;

  /**
   * Exporta un proyecto a CSV
   */
  exportProjectToCsv(project: Project): Promise<ExportResult>;

  /**
   * Exporta capacidades a JSON
   */
  exportCapabilitiesToJson(capabilities: Capability[]): Promise<ExportResult>;

  /**
   * Exporta funcionalidades a JSON
   */
  exportFunctionalitiesToJson(functionalities: Functionality[]): Promise<ExportResult>;

  /**
   * Exporta un proyecto a JSON
   */
  exportProjectToJson(project: Project): Promise<ExportResult>;

  /**
   * Exporta capacidades a PDF
   */
  exportCapabilitiesToPdf(capabilities: Capability[], options?: PdfExportOptions): Promise<ExportResult>;

  /**
   * Exporta un proyecto a PDF
   */
  exportProjectToPdf(project: Project, options?: PdfExportOptions): Promise<ExportResult>;

  /**
   * Exporta resultados de búsqueda
   */
  exportSearchResults(searchResult: SearchResult, format: ExportFormat): Promise<ExportResult>;

  /**
   * Exporta comparación entre capacidades
   */
  exportComparison(capabilities: Capability[], format: ExportFormat): Promise<ExportResult>;

  /**
   * Genera un reporte completo de un proyecto
   */
  generateProjectReport(project: Project, includeDetails?: boolean): Promise<ExportResult>;

  /**
   * Obtiene los formatos de exportación soportados
   */
  getSupportedFormats(): ExportFormat[];
}

/**
 * Formatos de exportación disponibles
 */
export type ExportFormat = 'csv' | 'json' | 'pdf' | 'xlsx' | 'xml';

/**
 * Resultado de una exportación
 */
export interface ExportResult {
  success: boolean;
  fileName: string;
  filePath?: string;
  fileSize: number;
  format: ExportFormat;
  recordCount: number;
  exportedAt: Date;
  downloadUrl?: string;
  error?: string;
}

/**
 * Opciones para exportación a PDF
 */
export interface PdfExportOptions {
  includeImages?: boolean;
  includeCharts?: boolean;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  header?: {
    text: string;
    includeDate?: boolean;
    includePage?: boolean;
  };
  footer?: {
    text: string;
    includeDate?: boolean;
    includePage?: boolean;
  };
  watermark?: string;
  compression?: boolean;
}
