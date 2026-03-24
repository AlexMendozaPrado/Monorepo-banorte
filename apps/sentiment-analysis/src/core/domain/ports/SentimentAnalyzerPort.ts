import { SentimentAnalysis } from '../entities/SentimentAnalysis';
import { EmotionScore } from '../value-objects/EmotionScore';
import { SentimentType } from '../value-objects/SentimentType';

export interface SentimentAnalysisRequest {
  text: string;
  clientName: string;
  documentName: string;
  channel: string;
}

export interface SentimentAnalysisResponse {
  overallSentiment: SentimentType;
  emotionScores: EmotionScore;
  confidence: number;
  reasoning?: string;
}

export interface SentimentAnalyzerPort {
  /**
   * Analiza el sentimiento del texto proporcionado
   * @param request La solicitud de análisis que contiene el texto y los metadatos
   * @returns Promesa con la respuesta del análisis de sentimiento
   */
  analyzeSentiment(request: SentimentAnalysisRequest): Promise<SentimentAnalysisResponse>;

  /**
   * Valida si el analizador está correctamente configurado y listo para usar
   * @returns Promise<boolean> que indica si el analizador está listo
   */
  isReady(): Promise<boolean>;

  /**
   * Obtiene la configuración actual del modelo
   * @returns Los detalles de configuración del modelo
   */
  getModelInfo(): {
    name: string;
    version: string;
    maxTokens: number;
  };
}

