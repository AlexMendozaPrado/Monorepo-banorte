import { EmotionScore } from '../value-objects/EmotionScore';
import { SentimentType } from '../value-objects/SentimentType';
import { AnalysisMetrics } from '../value-objects/AnalysisMetrics';

export interface SentimentAnalysis {
  id: string;
  clientName: string;
  documentName: string;
  documentContent: string;
  overallSentiment: SentimentType;
  emotionScores: EmotionScore;
  analysisMetrics: AnalysisMetrics;
  confidence: number;
  channel: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SentimentAnalysisEntity implements SentimentAnalysis {
  constructor(
    public readonly id: string,
    public readonly clientName: string,
    public readonly documentName: string,
    public readonly documentContent: string,
    public readonly overallSentiment: SentimentType,
    public readonly emotionScores: EmotionScore,
    public readonly analysisMetrics: AnalysisMetrics,
    public readonly confidence: number,
    public readonly channel: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateEntity();
  }

  private validateEntity(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('SentimentAnalysis ID cannot be empty');
    }
    
    if (!this.clientName || this.clientName.trim() === '') {
      throw new Error('Client name cannot be empty');
    }
    
    if (!this.documentName || this.documentName.trim() === '') {
      throw new Error('Document name cannot be empty');
    }
    
    if (!this.documentContent || this.documentContent.trim() === '') {
      throw new Error('Document content cannot be empty');
    }
    
    if (this.confidence < 0 || this.confidence > 1) {
      throw new Error('Confidence must be between 0 and 1');
    }
  }

  public isHighConfidence(): boolean {
    return this.confidence >= 0.8;
  }

  public getDominantEmotion(): keyof EmotionScore {
    const emotions = this.emotionScores;
    let maxEmotion: keyof EmotionScore = 'joy';
    let maxScore = emotions.joy;

    (Object.keys(emotions) as Array<keyof EmotionScore>).forEach(emotion => {
      if (emotions[emotion] > maxScore) {
        maxScore = emotions[emotion];
        maxEmotion = emotion;
      }
    });

    return maxEmotion;
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      clientName: this.clientName,
      documentName: this.documentName,
      documentContent: this.documentContent,
      overallSentiment: this.overallSentiment,
      emotionScores: this.emotionScores,
      analysisMetrics: this.analysisMetrics,
      confidence: this.confidence,
      channel: this.channel,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
