// Domain types for sentiment analysis

export type SentimentScore = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type SentimentLabel =
  | 'Muy Negativo'
  | 'Negativo'
  | 'Ligeramente Negativo'
  | 'Neutral'
  | 'Ligeramente Positivo'
  | 'Positivo'
  | 'Muy Positivo';

export type Emotion =
  | 'Alegría'
  | 'Neutral'
  | 'Sorpresa'
  | 'Tristeza'
  | 'Enojo'
  | 'Disgusto';

export interface EmotionData {
  emotion: Emotion;
  percentage: number;
}

export interface TimelinePoint {
  time: string;
  sentiment: number;
  context: string;
}

export interface KeywordData {
  word: string;
  frequency: number;
  sentiment: SentimentScore;
}

export type AlertPriority = 'Alta' | 'Media' | 'Baja';

export interface Alert {
  id: string;
  message: string;
  priority: AlertPriority;
  context: string;
  timestamp: string;
}

export interface HistoricalSession {
  id: string;
  date: string;
  sentiment: SentimentScore;
  delta: number;
  trend: 'up' | 'down' | 'stable';
}

export interface DocumentInfo {
  client: string;
  channel: string;
  date: string;
  duration: string;
  participants: string[];
}

export interface TextMetrics {
  words: number;
  sentences: number;
  avgWordsPerSentence: number;
  readability: string;
  readingTime: string;
  vocabularyType: string;
}

export interface SentimentAnalysisResult {
  sentimentScore: SentimentScore;
  confidenceLevel: number;
  emotions: EmotionData[];
  timeline: TimelinePoint[];
  keywords: KeywordData[];
  alerts: Alert[];
  documentInfo: DocumentInfo;
  textMetrics: TextMetrics;
}
