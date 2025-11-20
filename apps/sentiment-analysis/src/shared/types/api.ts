// API Types for the presentation layer
import { SentimentType } from '../../core/domain/value-objects/SentimentType';
import { EmotionScore } from '../../core/domain/value-objects/EmotionScore';
import { AnalysisMetrics } from '../../core/domain/value-objects/AnalysisMetrics';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AnalysisRequest {
  clientName: string;
  channel: string;
  file: File;
}

export interface AnalysisResponse {
  id: string;
  clientName: string;
  documentName: string;
  overallSentiment: SentimentType;
  emotionScores: EmotionScore;
  analysisMetrics: AnalysisMetrics;
  confidence: number;
  channel: string;
  createdAt: string;
  updatedAt: string;
  processingTimeMs: number;
}

export interface HistoricalAnalysisRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  clientName?: string;
  sentimentType?: SentimentType;
  channel?: string;
  dateFrom?: string;
  dateTo?: string;
  minConfidence?: number;
  maxConfidence?: number;
}

export interface HistoricalAnalysisResponse {
  analyses: {
    data: AnalysisResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  statistics: {
    totalAnalyses: number;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    averageConfidence: number;
    mostCommonChannel: string;
  };
}

export interface ExportRequest {
  format: 'csv' | 'json';
  includeMetadata?: boolean;
  includeEmotionScores?: boolean;
  dateFormat?: string;
  filter?: {
    clientName?: string;
    sentimentType?: SentimentType;
    channel?: string;
    dateFrom?: string;
    dateTo?: string;
    minConfidence?: number;
    maxConfidence?: number;
  };
}

export interface ExportResponse {
  filename: string;
  mimeType: string;
  size: number;
  exportedCount: number;
  totalAvailable: number;
  exportTimestamp: string;
}

export interface FilterOptionsResponse {
  clients: string[];
  channels: string[];
  sentimentTypes: SentimentType[];
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };
  confidenceRange: {
    min: number;
    max: number;
  };
}
