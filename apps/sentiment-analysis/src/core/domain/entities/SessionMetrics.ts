export interface TopicAnalysis {
  category: 'problem' | 'achievement' | 'coordination';
  topic: string;
  timeSpent: number; // minutos
  sentiment: number; // 1-7
  mentions: number;
}

export interface BlockerItem {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'resolved' | 'pending';
  mentions: number;
  firstMentioned: Date;
  lastMentioned: Date;
  context?: string;
}

export interface AchievementItem {
  id: string;
  description: string;
  metric?: string;
  value?: number;
  sentiment: number;
  impact: 'high' | 'medium' | 'low';
}

export interface ActionItem {
  id: string;
  description: string;
  assignee?: string;
  deadline?: Date;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

export interface KeywordFrequency {
  word: string;
  frequency: number;
  sentiment: number;
  category: string;
}

export interface TimelinePoint {
  timestamp: number; // minutos desde inicio
  sentiment: number; // 1-7
  context: string;
  event: string;
  participants?: string[];
}

export interface SessionMetrics {
  id: string;
  analysisId: string;

  // Métricas de sesión
  duration: number; // en minutos
  participantCount: number;
  topicsDiscussed: TopicAnalysis[];

  // Distribución de tiempo
  problemsTimePercentage: number;
  achievementsTimePercentage: number;
  coordinationTimePercentage: number;

  // KPIs calculados
  productivityScore: number; // 0-100
  effectivenessScore: number; // 0-100
  resolutionRate: number; // % de problemas resueltos
  engagementScore: number; // 0-100

  // Análisis de temas
  blockers: BlockerItem[];
  achievements: AchievementItem[];
  actionItems: ActionItem[];

  // Palabras clave
  keywords: KeywordFrequency[];

  // Timeline emocional
  emotionalTimeline: TimelinePoint[];

  createdAt: Date;
  updatedAt: Date;
}

export class SessionMetricsEntity implements SessionMetrics {
  constructor(
    public readonly id: string,
    public readonly analysisId: string,
    public readonly duration: number,
    public readonly participantCount: number,
    public readonly topicsDiscussed: TopicAnalysis[],
    public readonly problemsTimePercentage: number,
    public readonly achievementsTimePercentage: number,
    public readonly coordinationTimePercentage: number,
    public readonly productivityScore: number,
    public readonly effectivenessScore: number,
    public readonly resolutionRate: number,
    public readonly engagementScore: number,
    public readonly blockers: BlockerItem[],
    public readonly achievements: AchievementItem[],
    public readonly actionItems: ActionItem[],
    public readonly keywords: KeywordFrequency[],
    public readonly emotionalTimeline: TimelinePoint[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    this.validateEntity();
  }

  private validateEntity(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('SessionMetrics ID cannot be empty');
    }

    if (!this.analysisId || this.analysisId.trim() === '') {
      throw new Error('Analysis ID cannot be empty');
    }

    if (this.duration < 0) {
      throw new Error('Duration cannot be negative');
    }

    if (this.participantCount < 0) {
      throw new Error('Participant count cannot be negative');
    }

    if (this.productivityScore < 0 || this.productivityScore > 100) {
      throw new Error('Productivity score must be between 0 and 100');
    }

    if (this.effectivenessScore < 0 || this.effectivenessScore > 100) {
      throw new Error('Effectiveness score must be between 0 and 100');
    }

    if (this.resolutionRate < 0 || this.resolutionRate > 100) {
      throw new Error('Resolution rate must be between 0 and 100');
    }

    if (this.engagementScore < 0 || this.engagementScore > 100) {
      throw new Error('Engagement score must be between 0 and 100');
    }
  }

  public getActiveBlockers(): BlockerItem[] {
    return this.blockers.filter(b => b.status === 'active');
  }

  public getHighPriorityBlockers(): BlockerItem[] {
    return this.blockers.filter(b => b.priority === 'high');
  }

  public getCompletedActions(): ActionItem[] {
    return this.actionItems.filter(a => a.status === 'completed');
  }

  public getOverdueActions(): ActionItem[] {
    const now = new Date();
    return this.actionItems.filter(
      a => a.deadline && a.deadline < now && a.status !== 'completed'
    );
  }

  public getTopKeywords(limit: number = 10): KeywordFrequency[] {
    return [...this.keywords]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  public getAverageSentiment(): number {
    if (this.emotionalTimeline.length === 0) return 0;
    const sum = this.emotionalTimeline.reduce((acc, point) => acc + point.sentiment, 0);
    return sum / this.emotionalTimeline.length;
  }

  public getSentimentTrend(): 'improving' | 'declining' | 'stable' {
    if (this.emotionalTimeline.length < 2) return 'stable';

    const firstHalf = this.emotionalTimeline.slice(0, Math.floor(this.emotionalTimeline.length / 2));
    const secondHalf = this.emotionalTimeline.slice(Math.floor(this.emotionalTimeline.length / 2));

    const firstAvg = firstHalf.reduce((acc, p) => acc + p.sentiment, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((acc, p) => acc + p.sentiment, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (difference > 0.3) return 'improving';
    if (difference < -0.3) return 'declining';
    return 'stable';
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      analysisId: this.analysisId,
      duration: this.duration,
      participantCount: this.participantCount,
      topicsDiscussed: this.topicsDiscussed,
      problemsTimePercentage: this.problemsTimePercentage,
      achievementsTimePercentage: this.achievementsTimePercentage,
      coordinationTimePercentage: this.coordinationTimePercentage,
      productivityScore: this.productivityScore,
      effectivenessScore: this.effectivenessScore,
      resolutionRate: this.resolutionRate,
      engagementScore: this.engagementScore,
      blockers: this.blockers,
      achievements: this.achievements,
      actionItems: this.actionItems,
      keywords: this.keywords,
      emotionalTimeline: this.emotionalTimeline,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
