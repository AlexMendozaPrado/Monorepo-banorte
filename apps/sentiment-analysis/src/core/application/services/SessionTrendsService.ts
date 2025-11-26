import { SentimentAnalysis } from '../../domain/entities/SentimentAnalysis';
import {
  SessionTrends,
  SessionTrendsEntity,
  TimeSeriesPoint,
  MetricEvolution,
  RecurringTopic,
} from '../../domain/entities/SessionTrends';
import { SessionMetrics } from '../../domain/entities/SessionMetrics';
import { SentimentAnalysisRepositoryPort, AnalysisFilter } from '../../domain/ports/SentimentAnalysisRepositoryPort';
import { SessionMetricsRepositoryPort } from '../../domain/ports/SessionMetricsRepositoryPort';
import { SentimentType } from '../../domain/value-objects/SentimentType';
import { v4 as uuidv4 } from 'uuid';

export class SessionTrendsService {
  constructor(
    private analysisRepository: SentimentAnalysisRepositoryPort,
    private metricsRepository: SessionMetricsRepositoryPort
  ) {}

  async calculateTrends(from: Date, to: Date, filter?: AnalysisFilter): Promise<SessionTrends> {
    // Obtener análisis del período
    const analyses = await this.analysisRepository.findAll(
      { ...filter, dateFrom: from, dateTo: to },
      { page: 1, limit: 1000, sortBy: 'createdAt', sortOrder: 'asc' }
    );

    // Obtener métricas asociadas
    const metrics = await this.metricsRepository.findByAnalysisIds(analyses.data.map(a => a.id));

    // Calcular tendencias
    const timeSeries = this.buildTimeSeries(analyses.data, metrics);
    const npsEvolution = this.calculateNPSEvolution(analyses.data);
    const errorsEvolution = this.calculateErrorsEvolution(analyses.data);
    const velocityEvolution = this.calculateVelocityEvolution(metrics);
    const blockersEvolution = this.calculateBlockersEvolution(metrics);

    // Detectar patrones
    const recurringTopics = this.findRecurringTopics(metrics);
    const sentimentTrend = this.analyzeSentimentTrend(timeSeries);
    const productivityTrend = this.analyzeProductivityTrend(timeSeries);

    // Proyecciones
    const nextSessionProjection = this.projectNextSession(timeSeries);

    // Estadísticas adicionales
    const avgProductivity = this.calculateAverage(metrics.map(m => m.productivityScore));
    const avgSentiment = this.calculateAverageSentiment(analyses.data);
    const avgDuration = this.calculateAverage(metrics.map(m => m.duration));
    const avgBlockers = this.calculateAverage(metrics.map(m => m.blockers.length));
    const avgAchievements = this.calculateAverage(metrics.map(m => m.achievements.length));

    const trends = new SessionTrendsEntity(
      `trends-${uuidv4()}`,
      { from, to },
      analyses.data.length,
      avgProductivity,
      avgSentiment,
      avgDuration,
      this.countUniqueParticipants(metrics),
      timeSeries,
      npsEvolution,
      errorsEvolution,
      velocityEvolution,
      blockersEvolution,
      recurringTopics,
      sentimentTrend,
      productivityTrend,
      nextSessionProjection,
      this.findMostProductiveDay(analyses.data),
      undefined, // mostProductiveTimeOfDay
      avgBlockers,
      avgAchievements,
      new Date()
    );

    return trends;
  }

  private buildTimeSeries(analyses: SentimentAnalysis[], metrics: SessionMetrics[]): TimeSeriesPoint[] {
    const metricsMap = new Map(metrics.map(m => [m.analysisId, m]));

    return analyses.map(analysis => {
      const metric = metricsMap.get(analysis.id);
      const sentimentScore = analysis.overallSentiment === SentimentType.POSITIVE ? 6 :
                            analysis.overallSentiment === SentimentType.NEUTRAL ? 4 : 2;

      return {
        date: analysis.createdAt,
        productivityScore: metric?.productivityScore || 50,
        sentimentScore,
        blockersCount: metric?.blockers.length || 0,
        achievementsCount: metric?.achievements.length || 0,
        duration: metric?.duration || 0,
      };
    });
  }

  private calculateNPSEvolution(analyses: SentimentAnalysis[]): MetricEvolution[] {
    // Simulación de NPS basado en contenido
    return analyses.map((analysis, index) => {
      const content = analysis.documentContent.toLowerCase();
      const hasNPS = content.includes('nps');
      const npsMatch = content.match(/nps.*?(\d+)/i);
      const value = npsMatch ? parseInt(npsMatch[1]) : 0;

      const prevValue = index > 0 ? 85 : 0;
      const change = prevValue > 0 ? ((value - prevValue) / prevValue) * 100 : 0;

      return {
        date: analysis.createdAt,
        value: hasNPS && value > 0 ? value : 0,
        change,
        label: `NPS ${value}`,
      };
    }).filter(ev => ev.value > 0);
  }

  private calculateErrorsEvolution(analyses: SentimentAnalysis[]): MetricEvolution[] {
    return analyses.map((analysis, index) => {
      const content = analysis.documentContent.toLowerCase();
      const errorMatches = (content.match(/error/gi) || []).length;

      const prevValue = index > 0 ? 10 : 15;
      const value = Math.max(0, prevValue - errorMatches);
      const change = prevValue > 0 ? ((value - prevValue) / prevValue) * 100 : 0;

      return {
        date: analysis.createdAt,
        value,
        change,
        label: `${value} errores`,
      };
    });
  }

  private calculateVelocityEvolution(metrics: SessionMetrics[]): MetricEvolution[] {
    return metrics.map((metric, index) => {
      const value = metric.achievements.length || 0;
      const prevValue = index > 0 ? metrics[index - 1].achievements.length : value;
      const change = prevValue > 0 ? ((value - prevValue) / prevValue) * 100 : 0;

      return {
        date: metric.createdAt,
        value,
        change,
      };
    });
  }

  private calculateBlockersEvolution(metrics: SessionMetrics[]): MetricEvolution[] {
    return metrics.map((metric, index) => {
      const value = metric.blockers.filter(b => b.status === 'active').length;
      const prevValue = index > 0 ? metrics[index - 1].blockers.filter(b => b.status === 'active').length : value;
      const change = prevValue > 0 ? ((value - prevValue) / prevValue) * 100 : 0;

      return {
        date: metric.createdAt,
        value,
        change,
      };
    });
  }

  private findRecurringTopics(metrics: SessionMetrics[]): RecurringTopic[] {
    const topicMap = new Map<string, { count: number; sentiments: number[]; dates: Date[] }>();

    metrics.forEach(metric => {
      metric.topicsDiscussed.forEach(topic => {
        const existing = topicMap.get(topic.topic) || { count: 0, sentiments: [], dates: [] };
        existing.count += 1;
        existing.sentiments.push(topic.sentiment);
        existing.dates.push(metric.createdAt);
        topicMap.set(topic.topic, existing);
      });
    });

    const recurringTopics: RecurringTopic[] = [];
    topicMap.forEach((data, topic) => {
      if (data.count >= 2) {
        const avgSentiment = data.sentiments.reduce((a, b) => a + b, 0) / data.sentiments.length;
        recurringTopics.push({
          topic,
          occurrences: data.count,
          averageSentiment: avgSentiment,
          trend: 'stable',
          status: data.count >= 3 ? 'ongoing' : 'new',
          firstSeen: new Date(Math.min(...data.dates.map(d => d.getTime()))),
          lastSeen: new Date(Math.max(...data.dates.map(d => d.getTime()))),
        });
      }
    });

    return recurringTopics;
  }

  private analyzeSentimentTrend(timeSeries: TimeSeriesPoint[]): 'improving' | 'declining' | 'stable' {
    if (timeSeries.length < 2) return 'stable';

    const firstHalf = timeSeries.slice(0, Math.floor(timeSeries.length / 2));
    const secondHalf = timeSeries.slice(Math.floor(timeSeries.length / 2));

    const firstAvg = firstHalf.reduce((sum, p) => sum + p.sentimentScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.sentimentScore, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 10) return 'improving';
    if (change < -10) return 'declining';
    return 'stable';
  }

  private analyzeProductivityTrend(timeSeries: TimeSeriesPoint[]): 'improving' | 'declining' | 'stable' {
    if (timeSeries.length < 2) return 'stable';

    const firstHalf = timeSeries.slice(0, Math.floor(timeSeries.length / 2));
    const secondHalf = timeSeries.slice(Math.floor(timeSeries.length / 2));

    const firstAvg = firstHalf.reduce((sum, p) => sum + p.productivityScore, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.productivityScore, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 10) return 'improving';
    if (change < -10) return 'declining';
    return 'stable';
  }

  private projectNextSession(timeSeries: TimeSeriesPoint[]): {
    estimatedProductivity: number;
    estimatedSentiment: number;
    confidence: number;
  } {
    if (timeSeries.length === 0) {
      return { estimatedProductivity: 50, estimatedSentiment: 4, confidence: 0 };
    }

    const recent = timeSeries.slice(-3);
    const avgProductivity = recent.reduce((sum, p) => sum + p.productivityScore, 0) / recent.length;
    const avgSentiment = recent.reduce((sum, p) => sum + p.sentimentScore, 0) / recent.length;
    const confidence = Math.min(0.9, timeSeries.length / 10);

    return {
      estimatedProductivity: Math.round(avgProductivity),
      estimatedSentiment: Math.round(avgSentiment * 10) / 10,
      confidence,
    };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private calculateAverageSentiment(analyses: SentimentAnalysis[]): number {
    if (analyses.length === 0) return 0;

    const scores = analyses.map(a => {
      return a.overallSentiment === SentimentType.POSITIVE ? 6 :
             a.overallSentiment === SentimentType.NEUTRAL ? 4 : 2;
    });

    return this.calculateAverage(scores);
  }

  private countUniqueParticipants(metrics: SessionMetrics[]): number {
    const total = metrics.reduce((sum, m) => sum + m.participantCount, 0);
    return Math.round(total / (metrics.length || 1));
  }

  private findMostProductiveDay(analyses: SentimentAnalysis[]): string | undefined {
    if (analyses.length === 0) return undefined;

    const dayMap = new Map<string, number>();
    analyses.forEach(a => {
      const day = a.createdAt.toLocaleDateString('es-MX', { weekday: 'long' });
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    });

    let maxDay = '';
    let maxCount = 0;
    dayMap.forEach((count, day) => {
      if (count > maxCount) {
        maxCount = count;
        maxDay = day;
      }
    });

    return maxDay;
  }
}
