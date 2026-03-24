/**
 * Infraestructura de Análisis de Sesiones
 *
 * Implementaciones de SessionAnalysisPort para diferentes proveedores de IA.
 */

export { OpenAISessionAnalyzer } from './OpenAISessionAnalyzer';
export { SessionAnalyzerFactory } from './SessionAnalyzerFactory';
export type { SessionAnalyzerConfig, SessionAnalyzerProvider } from './SessionAnalyzerFactory';

// Exportar tipos del dominio por conveniencia
export type {
  SessionAnalysisPort,
  SessionMetricsAnalysisRequest,
  SessionMetricsAnalysisResponse,
  SessionConclusionAnalysisRequest,
  SessionConclusionAnalysisResponse,
} from '../../core/domain/ports/SessionAnalysisPort';
