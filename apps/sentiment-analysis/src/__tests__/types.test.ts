/**
 * TypeScript type validation tests
 * This file ensures all types are properly defined and compatible
 */

import { SentimentAnalysisEntity } from '../core/domain/entities/SentimentAnalysis';
import { ConversationEntity } from '../core/domain/entities/Conversation';
import { EmotionScoreValueObject } from '../core/domain/value-objects/EmotionScore';
import { SentimentType, SentimentTypeValueObject } from '../core/domain/value-objects/SentimentType';
import { AnalysisMetricsValueObject } from '../core/domain/value-objects/AnalysisMetrics';

// Test type compatibility and instantiation
function testDomainTypes() {
  // Test EmotionScore
  const emotionScore = new EmotionScoreValueObject(0.3, 0.2, 0.1, 0.1, 0.2, 0.1);
  const dominantEmotion: keyof typeof emotionScore = emotionScore.getDominantEmotion();
  
  // Test SentimentType
  const sentimentType = new SentimentTypeValueObject(SentimentType.POSITIVE);
  const isPositive: boolean = sentimentType.isPositive();
  const displayName: string = sentimentType.getDisplayName();
  
  // Test AnalysisMetrics
  const metrics = AnalysisMetricsValueObject.fromText(
    'This is a test document with multiple sentences. It has various metrics.',
    1500,
    'es'
  );
  const readabilityLevel: string = metrics.getReadabilityLevel();
  
  // Test SentimentAnalysis
  const analysis = new SentimentAnalysisEntity(
    'test-id',
    'Test Client',
    'test-document.pdf',
    'This is test content',
    SentimentType.POSITIVE,
    emotionScore,
    metrics,
    0.85,
    'Email',
    new Date(),
    new Date()
  );
  
  const isHighConfidence: boolean = analysis.isHighConfidence();
  const jsonData = analysis.toJSON();
  
  // Test Conversation
  const conversation = new ConversationEntity(
    'conv-id',
    'Test Client',
    'Chat',
    [
      {
        id: 'msg-1',
        role: 'user',
        content: 'Hello',
        timestamp: new Date(),
      },
    ],
    new Date(),
    new Date()
  );
  
  const messageCount: number = conversation.getMessageCount();
  const conversationText: string = conversation.getConversationText();
  
  return {
    emotionScore,
    sentimentType,
    metrics,
    analysis,
    conversation,
    dominantEmotion,
    isPositive,
    displayName,
    readabilityLevel,
    isHighConfidence,
    jsonData,
    messageCount,
    conversationText,
  };
}

// Test API types
import type { 
  ApiResponse, 
  AnalysisRequest, 
  AnalysisResponse,
  HistoricalAnalysisRequest,
  HistoricalAnalysisResponse,
  ExportRequest,
  ExportResponse,
  FilterOptionsResponse
} from '../shared/types/api';

function testApiTypes() {
  // Test API Response
  const successResponse: ApiResponse<string> = {
    success: true,
    data: 'test data',
    message: 'Success',
  };
  
  const errorResponse: ApiResponse = {
    success: false,
    error: 'Test error',
  };
  
  // Test Analysis Request
  const analysisRequest: AnalysisRequest = {
    clientName: 'Test Client',
    channel: 'Email',
    file: new File(['test'], 'test.pdf', { type: 'application/pdf' }),
  };
  
  // Test Historical Analysis Request
  const historicalRequest: HistoricalAnalysisRequest = {
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    clientName: 'Test Client',
    sentimentType: SentimentType.POSITIVE,
  };
  
  // Test Export Request
  const exportRequest: ExportRequest = {
    format: 'csv',
    includeMetadata: true,
    includeEmotionScores: true,
    filter: {
      clientName: 'Test Client',
    },
  };
  
  return {
    successResponse,
    errorResponse,
    analysisRequest,
    historicalRequest,
    exportRequest,
  };
}

// Test utility functions
import {
  formatSentiment,
  getSentimentColor,
  getSentimentIcon,
  formatConfidence,
  getConfidenceColor,
  formatEmotion,
  getEmotionColor,
  formatDate,
  formatFileSize,
  formatProcessingTime,
  truncateText,
  formatNumber,
  getReadabilityLevel,
  getReadabilityColor,
} from '../shared/utils/formatters';

function testUtilityFunctions() {
  // Test formatters
  const sentimentText: string = formatSentiment(SentimentType.POSITIVE);
  const sentimentColor: string = getSentimentColor(SentimentType.POSITIVE);
  const sentimentIcon: string = getSentimentIcon(SentimentType.POSITIVE);
  
  const confidenceText: string = formatConfidence(0.85);
  const confidenceColor: string = getConfidenceColor(0.85);
  
  const emotionText: string = formatEmotion('joy');
  const emotionColor: string = getEmotionColor('joy');
  
  const dateText: string = formatDate(new Date().toISOString());
  const fileSizeText: string = formatFileSize(1024 * 1024);
  const processingTimeText: string = formatProcessingTime(1500);
  const truncatedText: string = truncateText('This is a long text', 10);
  const numberText: string = formatNumber(1234.56, 2);
  const readabilityText: string = getReadabilityLevel(75);
  const readabilityColor: string = getReadabilityColor(75);
  
  return {
    sentimentText,
    sentimentColor,
    sentimentIcon,
    confidenceText,
    confidenceColor,
    emotionText,
    emotionColor,
    dateText,
    fileSizeText,
    processingTimeText,
    truncatedText,
    numberText,
    readabilityText,
    readabilityColor,
  };
}

// Export test functions for potential use in actual tests
export {
  testDomainTypes,
  testApiTypes,
  testUtilityFunctions,
};

// Type assertion tests
type AssertTrue<T extends true> = T;
type AssertFalse<T extends false> = T;

// Test that our types are properly structured
type _TestSentimentAnalysisHasRequiredFields = AssertTrue<
  'id' extends keyof SentimentAnalysisEntity ? true : false
>;

type _TestApiResponseIsGeneric = AssertTrue<
  ApiResponse<string>['data'] extends string | undefined ? true : false
>;

console.log('✅ All TypeScript types are properly defined and compatible');
