export interface TimeSeriesPoint {
  date: Date;
  productivityScore: number;
  sentimentScore: number;
  blockersCount: number;
  achievementsCount: number;
  duration: number;
}

export interface MetricEvolution {
  date: Date;
  value: number;
  change: number; // % vs anterior
  label?: string;
}

export interface RecurringTopic {
  topic: string;
  occurrences: number;
  averageSentiment: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  status: 'resolved' | 'ongoing' | 'new';
  firstSeen: Date;
  lastSeen: Date;
}

export interface SessionTrends {
  id: string;
  timeRange: {
    from: Date;
    to: Date;
  };

  // Tendencias generales
  sessionsCount: number;
  averageProductivity: number;
  averageSentiment: number;
  averageDuration: number;
  totalParticipants: number;

  // Serie temporal
  timeSeries: TimeSeriesPoint[];

  // Métricas comparativas
  npsEvolution: MetricEvolution[];
  errorsEvolution: MetricEvolution[];
  velocityEvolution: MetricEvolution[];
  blockersEvolution: MetricEvolution[];

  // Análisis de patrones
  recurringTopics: RecurringTopic[];
  sentimentTrend: 'improving' | 'declining' | 'stable';
  productivityTrend: 'improving' | 'declining' | 'stable';

  // Proyecciones
  nextSessionProjection: {
    estimatedProductivity: number;
    estimatedSentiment: number;
    confidence: number;
  };

  // Estadísticas adicionales
  mostProductiveDay?: string;
  mostProductiveTimeOfDay?: string;
  averageBlockersPerSession: number;
  averageAchievementsPerSession: number;

  createdAt: Date;
}

export class SessionTrendsEntity implements SessionTrends {
  constructor(
    public readonly id: string,
    public readonly timeRange: { from: Date; to: Date },
    public readonly sessionsCount: number,
    public readonly averageProductivity: number,
    public readonly averageSentiment: number,
    public readonly averageDuration: number,
    public readonly totalParticipants: number,
    public readonly timeSeries: TimeSeriesPoint[],
    public readonly npsEvolution: MetricEvolution[],
    public readonly errorsEvolution: MetricEvolution[],
    public readonly velocityEvolution: MetricEvolution[],
    public readonly blockersEvolution: MetricEvolution[],
    public readonly recurringTopics: RecurringTopic[],
    public readonly sentimentTrend: 'improving' | 'declining' | 'stable',
    public readonly productivityTrend: 'improving' | 'declining' | 'stable',
    public readonly nextSessionProjection: {
      estimatedProductivity: number;
      estimatedSentiment: number;
      confidence: number;
    },
    public readonly mostProductiveDay: string | undefined,
    public readonly mostProductiveTimeOfDay: string | undefined,
    public readonly averageBlockersPerSession: number,
    public readonly averageAchievementsPerSession: number,
    public readonly createdAt: Date
  ) {
    this.validateEntity();
  }

  private validateEntity(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('SessionTrends ID cannot be empty');
    }

    if (this.timeRange.from >= this.timeRange.to) {
      throw new Error('Invalid time range: from must be before to');
    }

    if (this.sessionsCount < 0) {
      throw new Error('Sessions count cannot be negative');
    }

    if (this.averageProductivity < 0 || this.averageProductivity > 100) {
      throw new Error('Average productivity must be between 0 and 100');
    }

    if (this.averageSentiment < 1 || this.averageSentiment > 7) {
      throw new Error('Average sentiment must be between 1 and 7');
    }
  }

  public getLatestTrend(): TimeSeriesPoint | null {
    if (this.timeSeries.length === 0) return null;
    return this.timeSeries[this.timeSeries.length - 1];
  }

  public getProductivityChange(): number {
    if (this.timeSeries.length < 2) return 0;
    const first = this.timeSeries[0].productivityScore;
    const last = this.timeSeries[this.timeSeries.length - 1].productivityScore;
    return ((last - first) / first) * 100;
  }

  public getSentimentChange(): number {
    if (this.timeSeries.length < 2) return 0;
    const first = this.timeSeries[0].sentimentScore;
    const last = this.timeSeries[this.timeSeries.length - 1].sentimentScore;
    return ((last - first) / first) * 100;
  }

  public getCriticalTopics(): RecurringTopic[] {
    return this.recurringTopics.filter(
      t => t.status === 'ongoing' && t.averageSentiment < 4 && t.occurrences >= 3
    );
  }

  public getResolvedTopics(): RecurringTopic[] {
    return this.recurringTopics.filter(t => t.status === 'resolved');
  }

  public getNewTopics(): RecurringTopic[] {
    return this.recurringTopics.filter(t => t.status === 'new');
  }

  public isProductivityImproving(): boolean {
    return this.productivityTrend === 'improving';
  }

  public isSentimentImproving(): boolean {
    return this.sentimentTrend === 'improving';
  }

  public getProjectionAccuracy(): 'high' | 'medium' | 'low' {
    if (this.nextSessionProjection.confidence >= 0.8) return 'high';
    if (this.nextSessionProjection.confidence >= 0.6) return 'medium';
    return 'low';
  }

  public toJSON(): Record<string, any> {
    return {
      id: this.id,
      timeRange: {
        from: this.timeRange.from.toISOString(),
        to: this.timeRange.to.toISOString(),
      },
      sessionsCount: this.sessionsCount,
      averageProductivity: this.averageProductivity,
      averageSentiment: this.averageSentiment,
      averageDuration: this.averageDuration,
      totalParticipants: this.totalParticipants,
      timeSeries: this.timeSeries.map(ts => ({
        ...ts,
        date: ts.date.toISOString(),
      })),
      npsEvolution: this.npsEvolution.map(ev => ({
        ...ev,
        date: ev.date.toISOString(),
      })),
      errorsEvolution: this.errorsEvolution.map(ev => ({
        ...ev,
        date: ev.date.toISOString(),
      })),
      velocityEvolution: this.velocityEvolution.map(ev => ({
        ...ev,
        date: ev.date.toISOString(),
      })),
      blockersEvolution: this.blockersEvolution.map(ev => ({
        ...ev,
        date: ev.date.toISOString(),
      })),
      recurringTopics: this.recurringTopics.map(rt => ({
        ...rt,
        firstSeen: rt.firstSeen.toISOString(),
        lastSeen: rt.lastSeen.toISOString(),
      })),
      sentimentTrend: this.sentimentTrend,
      productivityTrend: this.productivityTrend,
      nextSessionProjection: this.nextSessionProjection,
      mostProductiveDay: this.mostProductiveDay,
      mostProductiveTimeOfDay: this.mostProductiveTimeOfDay,
      averageBlockersPerSession: this.averageBlockersPerSession,
      averageAchievementsPerSession: this.averageAchievementsPerSession,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
