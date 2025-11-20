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
   * Analyzes the sentiment of the provided text
   * @param request The analysis request containing text and metadata
   * @returns Promise with the sentiment analysis response
   */
  analyzeSentiment(request: SentimentAnalysisRequest): Promise<SentimentAnalysisResponse>;

  /**
   * Validates if the analyzer is properly configured and ready to use
   * @returns Promise<boolean> indicating if the analyzer is ready
   */
  isReady(): Promise<boolean>;

  /**
   * Gets the current model configuration
   * @returns The model configuration details
   */
  getModelInfo(): {
    name: string;
    version: string;
    maxTokens: number;
  };
}

