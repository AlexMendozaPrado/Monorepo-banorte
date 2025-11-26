import { SentimentAnalysis } from '../../domain/entities/SentimentAnalysis';
import {
  SessionMetrics,
  SessionMetricsEntity,
  TopicAnalysis,
  BlockerItem,
  AchievementItem,
  ActionItem,
  KeywordFrequency,
  TimelinePoint,
} from '../../domain/entities/SessionMetrics';
import { SentimentType } from '../../domain/value-objects/SentimentType';
import { SessionMetricsRepositoryPort } from '../../domain/ports/SessionMetricsRepositoryPort';
import { SessionAnalysisPort } from '../../domain/ports/SessionAnalysisPort';
import { v4 as uuidv4 } from 'uuid';

/**
 * Servicio de aplicación para cálculo de métricas de sesión
 *
 * Estrategia: AI-first con fallback a reglas determinísticas
 * - Si aiAnalyzer está disponible, usa análisis de IA
 * - Si falla o no está disponible, usa lógica basada en reglas
 */
export class SessionMetricsService {
  constructor(
    private metricsRepository: SessionMetricsRepositoryPort,
    private aiAnalyzer?: SessionAnalysisPort
  ) {}

  /**
   * Calcula métricas de sesión usando AI o fallback a reglas
   */
  async calculateSessionMetrics(analysis: SentimentAnalysis): Promise<SessionMetrics> {
    // Estrategia AI-first con graceful degradation
    if (this.aiAnalyzer) {
      try {
        const aiMetrics = await this.generateWithAI(analysis);
        return await this.metricsRepository.save(aiMetrics);
      } catch (error) {
        console.warn('AI metrics analysis failed, falling back to rule-based approach:', error);
        // Continue to rule-based approach
      }
    }

    // Fallback: Rule-based metrics
    const ruleBasedMetrics = await this.generateWithRules(analysis);
    return await this.metricsRepository.save(ruleBasedMetrics);
  }

  /**
   * Genera métricas usando análisis de IA (LLM)
   */
  private async generateWithAI(analysis: SentimentAnalysis): Promise<SessionMetrics> {
    if (!this.aiAnalyzer) {
      throw new Error('AI analyzer not available');
    }

    const response = await this.aiAnalyzer.analyzeMetrics({
      transcript: analysis.documentContent,
      overallSentiment: analysis.overallSentiment,
      confidence: analysis.confidence,
      clientName: analysis.clientName,
      documentName: analysis.documentName,
      metadata: {
        channel: analysis.channel,
        wordCount: analysis.analysisMetrics.wordCount,
      },
    });

    // Mapear respuesta de IA a SessionMetrics entity
    return this.mapAIResponseToMetrics(analysis.id, response);
  }

  /**
   * Mapea la respuesta de IA a SessionMetrics entity
   */
  private mapAIResponseToMetrics(
    analysisId: string,
    response: any
  ): SessionMetrics {
    // Mapear topics (ya vienen en formato correcto)
    const topicsDiscussed: TopicAnalysis[] = response.topics.map((t: any) => ({
      category: t.category,
      topic: t.topic,
      timeSpent: t.timePercentage, // API usa timePercentage, entity usa timeSpent
      sentiment: t.sentiment,
      mentions: t.mentions,
    }));

    // Mapear blockers con IDs y timestamps
    const blockers: BlockerItem[] = response.blockers.map((b: any) => ({
      id: `blocker-${uuidv4()}`,
      description: b.description,
      priority: b.priority,
      status: b.status,
      mentions: b.mentions,
      firstMentioned: new Date(),
      lastMentioned: new Date(),
      context: b.context,
    }));

    // Mapear achievements con IDs
    const achievements: AchievementItem[] = response.achievements.map((a: any) => ({
      id: `achievement-${uuidv4()}`,
      description: a.description,
      metric: a.metric,
      value: a.value,
      sentiment: a.sentiment,
      impact: a.impact,
    }));

    // Mapear action items con IDs y parsear deadlines
    const actionItems: ActionItem[] = response.actionItems.map((item: any) => ({
      id: `action-${uuidv4()}`,
      description: item.description,
      assignee: item.assignee,
      deadline: item.deadline ? new Date(item.deadline) : undefined,
      status: 'pending' as const,
      priority: item.priority,
    }));

    // Mapear keywords (formato correcto)
    const keywords: KeywordFrequency[] = response.keywords;

    // Mapear timeline (formato correcto)
    const emotionalTimeline: TimelinePoint[] = response.emotionalTimeline;

    // Crear entity con datos mapeados
    return new SessionMetricsEntity(
      `metrics-${uuidv4()}`,
      analysisId,
      response.durationMinutes,
      response.participants.length,
      topicsDiscussed,
      response.timeDistribution.problemsPercentage,
      response.timeDistribution.achievementsPercentage,
      response.timeDistribution.coordinationPercentage,
      response.scores.productivity,
      response.scores.effectiveness,
      response.scores.resolutionRate,
      response.scores.engagement,
      blockers,
      achievements,
      actionItems,
      keywords,
      emotionalTimeline,
      new Date(),
      new Date()
    );
  }

  /**
   * Genera métricas usando lógica basada en reglas (fallback)
   * Mantiene la lógica determinística original
   */
  private async generateWithRules(analysis: SentimentAnalysis): Promise<SessionMetrics> {
    const duration = this.estimateDuration(analysis.analysisMetrics.wordCount);
    const participantCount = this.detectParticipants(analysis.documentContent);
    const topicsDiscussed = this.analyzeTopics(analysis.documentContent, analysis.overallSentiment);
    const timeDistribution = this.calculateTimeDistribution(topicsDiscussed, duration);

    const productivityScore = this.calculateProductivityScore(analysis, topicsDiscussed);
    const effectivenessScore = this.calculateEffectivenessScore(analysis, topicsDiscussed);
    const resolutionRate = this.calculateResolutionRate(topicsDiscussed);
    const engagementScore = this.calculateEngagementScore(analysis, participantCount);

    const blockers = this.extractBlockers(analysis.documentContent);
    const achievements = this.extractAchievements(analysis.documentContent, analysis.overallSentiment);
    const actionItems = this.extractActionItems(analysis.documentContent);
    const keywords = this.extractKeywords(analysis.documentContent, analysis.overallSentiment);
    const emotionalTimeline = this.generateEmotionalTimeline(analysis);

    return new SessionMetricsEntity(
      `metrics-${uuidv4()}`,
      analysis.id,
      duration,
      participantCount,
      topicsDiscussed,
      timeDistribution.problems,
      timeDistribution.achievements,
      timeDistribution.coordination,
      productivityScore,
      effectivenessScore,
      resolutionRate,
      engagementScore,
      blockers,
      achievements,
      actionItems,
      keywords,
      emotionalTimeline,
      new Date(),
      new Date()
    );
  }

  private estimateDuration(wordCount: number): number {
    // Promedio de habla: 150 palabras/minuto
    return Math.ceil(wordCount / 150);
  }

  private detectParticipants(content: string): number {
    // Detectar nombres propios únicos con patrón mejorado
    const names = new Set<string>();
    const namePattern = /\b[A-Z][A-Z\s]+(?=[:\n]|dijo|comentó|mencionó)/g;
    const matches = content.match(namePattern);
    if (matches) {
      matches.forEach(name => names.add(name.trim()));
    }
    return Math.max(names.size, 2); // Mínimo 2 participantes
  }

  private analyzeTopics(content: string, sentiment: SentimentType): TopicAnalysis[] {
    const topics: TopicAnalysis[] = [];

    // Palabras clave para problemas
    const problemKeywords = ['error', 'problema', 'blocker', 'fallo', 'pendiente', 'retraso', 'falta'];
    const achievementKeywords = ['logro', 'éxito', 'completado', 'nps', 'mejora', 'alcanzado'];
    const coordinationKeywords = ['tarea', 'asignar', 'plan', 'fecha', 'seguimiento', 'reunión'];

    // Análisis simplificado de temas
    const contentLower = content.toLowerCase();

    let problemCount = 0;
    let achievementCount = 0;
    let coordinationCount = 0;

    problemKeywords.forEach(keyword => {
      const matches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
      problemCount += matches;
    });

    achievementKeywords.forEach(keyword => {
      const matches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
      achievementCount += matches;
    });

    coordinationKeywords.forEach(keyword => {
      const matches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
      coordinationCount += matches;
    });

    const total = problemCount + achievementCount + coordinationCount || 1;
    const sentimentScore = sentiment === SentimentType.POSITIVE ? 6 : sentiment === SentimentType.NEUTRAL ? 4 : 2;

    if (problemCount > 0) {
      topics.push({
        category: 'problem',
        topic: 'Problemas y Blockers',
        timeSpent: Math.round((problemCount / total) * 100),
        sentiment: Math.max(1, sentimentScore - 1),
        mentions: problemCount,
      });
    }

    if (achievementCount > 0) {
      topics.push({
        category: 'achievement',
        topic: 'Logros y Avances',
        timeSpent: Math.round((achievementCount / total) * 100),
        sentiment: Math.min(7, sentimentScore + 1),
        mentions: achievementCount,
      });
    }

    if (coordinationCount > 0) {
      topics.push({
        category: 'coordination',
        topic: 'Coordinación y Seguimiento',
        timeSpent: Math.round((coordinationCount / total) * 100),
        sentiment: sentimentScore,
        mentions: coordinationCount,
      });
    }

    return topics;
  }

  private calculateTimeDistribution(topics: TopicAnalysis[], duration: number): {
    problems: number;
    achievements: number;
    coordination: number;
  } {
    const total = topics.reduce((sum, t) => sum + t.timeSpent, 0) || 100;

    const problemsTime = topics.filter(t => t.category === 'problem').reduce((sum, t) => sum + t.timeSpent, 0);
    const achievementsTime = topics.filter(t => t.category === 'achievement').reduce((sum, t) => sum + t.timeSpent, 0);
    const coordinationTime = topics.filter(t => t.category === 'coordination').reduce((sum, t) => sum + t.timeSpent, 0);

    return {
      problems: Math.round((problemsTime / total) * 100),
      achievements: Math.round((achievementsTime / total) * 100),
      coordination: Math.round((coordinationTime / total) * 100),
    };
  }

  private calculateProductivityScore(analysis: SentimentAnalysis, topics: TopicAnalysis[]): number {
    let score = 50; // Base score

    // Adjust based on sentiment
    if (analysis.overallSentiment === SentimentType.POSITIVE) score += 20;
    else if (analysis.overallSentiment === SentimentType.NEGATIVE) score -= 10;

    // Boost for achievements
    const achievementsCount = topics.filter(t => t.category === 'achievement').length;
    score += achievementsCount * 10;

    // Penalize for too many problems
    const problemsPercentage = topics
      .filter(t => t.category === 'problem')
      .reduce((sum, t) => sum + t.timeSpent, 0) / 100;

    if (problemsPercentage > 0.6) score -= 15;

    // Confidence bonus
    if (analysis.confidence > 0.8) score += 5;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  private calculateEffectivenessScore(analysis: SentimentAnalysis, topics: TopicAnalysis[]): number {
    let score = 60; // Base score

    // High confidence is a good indicator
    score += analysis.confidence * 20;

    // Diverse topics indicate good coverage
    if (topics.length >= 3) score += 10;

    // Balance is good
    const hasBalance = topics.every(t => t.timeSpent >= 20 && t.timeSpent <= 50);
    if (hasBalance) score += 10;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  private calculateResolutionRate(topics: TopicAnalysis[]): number {
    const problemTopics = topics.filter(t => t.category === 'problem');
    const achievementTopics = topics.filter(t => t.category === 'achievement');

    if (problemTopics.length === 0) return 100;

    const resolved = Math.min(achievementTopics.length, problemTopics.length);
    return Math.round((resolved / problemTopics.length) * 100);
  }

  private calculateEngagementScore(analysis: SentimentAnalysis, participantCount: number): number {
    let score = 50;

    // More participants = higher engagement
    score += Math.min(participantCount * 10, 30);

    // Word count indicates engagement
    if (analysis.analysisMetrics.wordCount > 500) score += 10;
    if (analysis.analysisMetrics.wordCount > 1000) score += 10;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  private extractBlockers(content: string): BlockerItem[] {
    const blockers: BlockerItem[] = [];
    const blockerKeywords = ['blocker', 'problema', 'falta', 'pendiente', 'sin acceso', 'sin permisos'];

    const lines = content.split('\n');
    lines.forEach(line => {
      const lineLower = line.toLowerCase();
      blockerKeywords.forEach(keyword => {
        if (lineLower.includes(keyword)) {
          blockers.push({
            id: `blocker-${uuidv4()}`,
            description: line.substring(0, 200),
            priority: this.determinePriority(line),
            status: 'active',
            mentions: 1,
            firstMentioned: new Date(),
            lastMentioned: new Date(),
            context: keyword,
          });
        }
      });
    });

    return blockers.slice(0, 5); // Limit to top 5
  }

  private extractAchievements(content: string, sentiment: SentimentType): AchievementItem[] {
    const achievements: AchievementItem[] = [];
    const achievementKeywords = ['logro', 'éxito', 'completado', 'alcanzado', 'nps', 'mejora'];

    const lines = content.split('\n');
    lines.forEach(line => {
      const lineLower = line.toLowerCase();
      achievementKeywords.forEach(keyword => {
        if (lineLower.includes(keyword)) {
          achievements.push({
            id: `achievement-${uuidv4()}`,
            description: line.substring(0, 200),
            sentiment: sentiment === SentimentType.POSITIVE ? 6 : 5,
            impact: 'medium',
          });
        }
      });
    });

    return achievements.slice(0, 5); // Limit to top 5
  }

  private extractActionItems(content: string): ActionItem[] {
    const actions: ActionItem[] = [];
    const actionKeywords = ['tarea', 'asignar', 'pendiente', 'debe', 'necesita'];

    const lines = content.split('\n');
    lines.forEach(line => {
      const lineLower = line.toLowerCase();
      actionKeywords.forEach(keyword => {
        if (lineLower.includes(keyword)) {
          actions.push({
            id: `action-${uuidv4()}`,
            description: line.substring(0, 200),
            status: 'pending',
            priority: this.determinePriority(line),
          });
        }
      });
    });

    return actions.slice(0, 10); // Limit to top 10
  }

  private extractKeywords(content: string, sentiment: SentimentType): KeywordFrequency[] {
    const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const stopWords = ['para', 'con', 'por', 'en', 'de', 'la', 'el', 'los', 'las', 'un', 'una', 'este', 'esta', 'estos', 'estas'];

    const wordCounts = new Map<string, number>();
    words.forEach(word => {
      if (!stopWords.includes(word)) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    });

    const keywords: KeywordFrequency[] = [];
    const sentimentScore = sentiment === SentimentType.POSITIVE ? 6 : sentiment === SentimentType.NEUTRAL ? 4 : 2;

    wordCounts.forEach((frequency, word) => {
      if (frequency > 1) {
        keywords.push({
          word,
          frequency,
          sentiment: sentimentScore,
          category: 'general',
        });
      }
    });

    return keywords.sort((a, b) => b.frequency - a.frequency).slice(0, 20);
  }

  private generateEmotionalTimeline(analysis: SentimentAnalysis): TimelinePoint[] {
    const timeline: TimelinePoint[] = [];
    const sentimentScore = analysis.overallSentiment === SentimentType.POSITIVE ? 6 :
                          analysis.overallSentiment === SentimentType.NEUTRAL ? 4 : 2;

    // Simplified timeline with 3 points: inicio, desarrollo, final
    timeline.push({
      timestamp: 0,
      sentiment: sentimentScore,
      context: 'Inicio de sesión',
      event: 'Presentaciones iniciales',
    });

    timeline.push({
      timestamp: 50,
      sentiment: sentimentScore,
      context: 'Desarrollo',
      event: 'Discusión de temas principales',
    });

    timeline.push({
      timestamp: 100,
      sentiment: sentimentScore,
      context: 'Cierre',
      event: 'Conclusiones y próximos pasos',
    });

    return timeline;
  }

  private determinePriority(text: string): 'high' | 'medium' | 'low' {
    const highPriorityWords = ['urgente', 'crítico', 'importante', 'blocker', 'alta'];
    const textLower = text.toLowerCase();

    if (highPriorityWords.some(word => textLower.includes(word))) {
      return 'high';
    }

    return 'medium';
  }

  async getMetricsByAnalysisId(analysisId: string): Promise<SessionMetrics | null> {
    return await this.metricsRepository.findByAnalysisId(analysisId);
  }

  async getAllMetrics(): Promise<SessionMetrics[]> {
    return await this.metricsRepository.findAll();
  }
}
