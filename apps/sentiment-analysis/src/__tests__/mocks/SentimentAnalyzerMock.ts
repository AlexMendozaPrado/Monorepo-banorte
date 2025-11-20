import {
  SentimentAnalyzerPort,
  SentimentAnalysisRequest,
  SentimentAnalysisResponse
} from '../../core/domain/ports/SentimentAnalyzerPort';
import { SentimentType } from '../../core/domain/value-objects/SentimentType';
import { MOCK_EMOTION_POSITIVE, MOCK_EMOTION_NEGATIVE, MOCK_EMOTION_NEUTRAL } from './testData';

/**
 * Mock implementation of SentimentAnalyzerPort for testing
 * Provides configurable responses for different test scenarios
 */
export class SentimentAnalyzerMock implements SentimentAnalyzerPort {
  private ready: boolean = true;
  private shouldFail: boolean = false;
  private mockResponse: SentimentAnalysisResponse | null = null;
  private callHistory: SentimentAnalysisRequest[] = [];

  async analyzeSentiment(request: SentimentAnalysisRequest): Promise<SentimentAnalysisResponse> {
    this.callHistory.push(request);

    if (this.shouldFail) {
      throw new Error('Sentiment analyzer failed');
    }

    if (this.mockResponse) {
      return this.mockResponse;
    }

    // Default behavior: return positive sentiment
    return {
      overallSentiment: SentimentType.POSITIVE,
      emotionScores: MOCK_EMOTION_POSITIVE,
      confidence: 0.92,
      reasoning: 'Mock analysis reasoning',
    };
  }

  async isReady(): Promise<boolean> {
    return this.ready;
  }

  getModelInfo() {
    return {
      name: 'mock-model',
      version: '1.0.0',
      maxTokens: 4000,
    };
  }

  // Test utility methods
  setReady(ready: boolean): void {
    this.ready = ready;
  }

  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  setMockResponse(response: SentimentAnalysisResponse): void {
    this.mockResponse = response;
  }

  getCallHistory(): SentimentAnalysisRequest[] {
    return this.callHistory;
  }

  reset(): void {
    this.ready = true;
    this.shouldFail = false;
    this.mockResponse = null;
    this.callHistory = [];
  }
}

/**
 * Factory function to create a configured mock
 */
export const createSentimentAnalyzerMock = (config?: {
  ready?: boolean;
  shouldFail?: boolean;
  response?: SentimentAnalysisResponse;
}): SentimentAnalyzerMock => {
  const mock = new SentimentAnalyzerMock();

  if (config?.ready !== undefined) {
    mock.setReady(config.ready);
  }

  if (config?.shouldFail) {
    mock.setShouldFail(config.shouldFail);
  }

  if (config?.response) {
    mock.setMockResponse(config.response);
  }

  return mock;
};
