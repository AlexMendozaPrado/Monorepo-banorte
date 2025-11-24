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

// Session Metrics Types
export interface SessionMetricsResponse {
  id: string;
  analysisId: string;
  duration: number;
  participantCount: number;
  topicsDiscussed: Array<{
    category: 'problem' | 'achievement' | 'coordination';
    topic: string;
    timeSpent: number;
    sentiment: number;
    mentions: number;
  }>;
  problemsTimePercentage: number;
  achievementsTimePercentage: number;
  coordinationTimePercentage: number;
  productivityScore: number;
  effectivenessScore: number;
  resolutionRate: number;
  engagementScore: number;
  blockers: Array<{
    id: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    status: 'active' | 'resolved' | 'pending';
    mentions: number;
    firstMentioned: string;
    lastMentioned: string;
    context?: string;
  }>;
  achievements: Array<{
    id: string;
    description: string;
    metric?: string;
    value?: number;
    sentiment: number;
    impact: 'high' | 'medium' | 'low';
  }>;
  actionItems: Array<{
    id: string;
    description: string;
    assignee?: string;
    deadline?: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'high' | 'medium' | 'low';
  }>;
  keywords: Array<{
    word: string;
    frequency: number;
    sentiment: number;
    category: string;
  }>;
  emotionalTimeline: Array<{
    timestamp: number;
    sentiment: number;
    context: string;
    event: string;
    participants?: string[];
  }>;
  createdAt: string;
  updatedAt: string;
}

// Session Trends Types
export interface SessionTrendsResponse {
  id: string;
  timeRange: {
    from: string;
    to: string;
  };
  sessionsCount: number;
  averageProductivity: number;
  averageSentiment: number;
  averageDuration: number;
  totalParticipants: number;
  timeSeries: Array<{
    date: string;
    productivityScore: number;
    sentimentScore: number;
    blockersCount: number;
    achievementsCount: number;
    duration: number;
  }>;
  npsEvolution: Array<{
    date: string;
    value: number;
    change: number;
    label?: string;
  }>;
  errorsEvolution: Array<{
    date: string;
    value: number;
    change: number;
    label?: string;
  }>;
  velocityEvolution: Array<{
    date: string;
    value: number;
    change: number;
  }>;
  blockersEvolution: Array<{
    date: string;
    value: number;
    change: number;
  }>;
  recurringTopics: Array<{
    topic: string;
    occurrences: number;
    averageSentiment: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    status: 'resolved' | 'ongoing' | 'new';
    firstSeen: string;
    lastSeen: string;
  }>;
  sentimentTrend: 'improving' | 'declining' | 'stable';
  productivityTrend: 'improving' | 'declining' | 'stable';
  nextSessionProjection: {
    estimatedProductivity: number;
    estimatedSentiment: number;
    confidence: number;
  };
  mostProductiveDay?: string;
  mostProductiveTimeOfDay?: string;
  averageBlockersPerSession: number;
  averageAchievementsPerSession: number;
  createdAt: string;
}

// Session Conclusion Types
export interface SessionConclusionResponse {
  id: string;
  analysisId: string;
  executiveSummary: string;
  overallScore: number;
  risks: Array<{
    id: string;
    level: 'high' | 'medium' | 'low';
    description: string;
    impact: string;
    recommendation: string;
    detectedAt: string;
  }>;
  opportunities: Array<{
    id: string;
    description: string;
    potentialValue: string;
    priority: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
  }>;
  actionPlan: {
    immediate: Array<{
      id: string;
      description: string;
      assignee?: string;
      deadline?: string;
      priority: 'high' | 'medium' | 'low';
      status: 'pending' | 'in_progress' | 'completed';
    }>;
    shortTerm: Array<{
      id: string;
      description: string;
      assignee?: string;
      deadline?: string;
      priority: 'high' | 'medium' | 'low';
      status: 'pending' | 'in_progress' | 'completed';
    }>;
    continuous: Array<{
      id: string;
      description: string;
      assignee?: string;
      deadline?: string;
      priority: 'high' | 'medium' | 'low';
      status: 'pending' | 'in_progress' | 'completed';
    }>;
  };
  insights: {
    forAccountManager: string[];
    forTechnicalTeam: string[];
    forManagement: string[];
  };
  teamClimate: {
    moral: number;
    collaboration: number;
    proactivity: number;
    overall: number;
  };
  satisfactionScore: number;
  recommendations: string[];
  nextSteps: string[];
  createdAt: string;
  updatedAt: string;
}

// Combined Dashboard Response
export interface SessionDashboardResponse {
  analysis: AnalysisResponse;
  metrics: SessionMetricsResponse;
  conclusion: SessionConclusionResponse;
  historicalComparison?: {
    previousSession?: SessionMetricsResponse;
    averages: {
      productivity: number;
      sentiment: number;
      effectiveness: number;
    };
  };
}

// Trends Request
export interface SessionTrendsRequest {
  from: string;
  to: string;
  clientName?: string;
  channel?: string;
}
