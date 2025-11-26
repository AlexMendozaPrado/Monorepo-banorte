/**
 * Session Analysis Infrastructure
 *
 * Implementaciones de SessionAnalysisPort para diferentes providers de IA.
 */

export { OpenAISessionAnalyzer } from './OpenAISessionAnalyzer';
export { SessionAnalyzerFactory } from './SessionAnalyzerFactory';
export type { SessionAnalyzerConfig, SessionAnalyzerProvider } from './SessionAnalyzerFactory';

// Export types from domain for convenience
export type {
  SessionAnalysisPort,
  SessionMetricsAnalysisRequest,
  SessionMetricsAnalysisResponse,
  SessionConclusionAnalysisRequest,
  SessionConclusionAnalysisResponse,
} from '../../core/domain/ports/SessionAnalysisPort';
