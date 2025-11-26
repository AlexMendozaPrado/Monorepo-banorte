import { SentimentAnalysis } from '../../domain/entities/SentimentAnalysis';
import { SessionMetrics } from '../../domain/entities/SessionMetrics';
import {
  SessionConclusion,
  SessionConclusionEntity,
  RiskItem,
  OpportunityItem,
  ActionPlanItem,
  BusinessInsights,
  TeamClimate,
} from '../../domain/value-objects/SessionConclusion';
import { SessionConclusionRepositoryPort } from '../../domain/ports/SessionConclusionRepositoryPort';
import { SessionAnalysisPort } from '../../domain/ports/SessionAnalysisPort';
import { SentimentType } from '../../domain/value-objects/SentimentType';
import { v4 as uuidv4 } from 'uuid';

interface ConclusionAIResponse {
  executiveSummary: string;
  risks: Array<{ level: string; description: string; impact: string; recommendation: string }>;
  opportunities: Array<{ description: string; potentialValue: string; priority: string; effort: string }>;
  actionPlan: {
    immediate: Array<{ description: string; priority: string }>;
    shortTerm: Array<{ description: string; priority: string }>;
    continuous: Array<{ description: string; priority: string }>;
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
  };
  satisfactionScore: number;
  recommendations: string[];
  nextSteps: string[];
}

/**
 * Servicio de aplicación para generación de conclusiones de sesión
 *
 * Estrategia: AI-first con fallback a reglas determinísticas
 * - Si aiAnalyzer está disponible, usa análisis de IA
 * - Si falla o no está disponible, usa lógica basada en reglas
 */
export class SessionConclusionService {
  constructor(
    private conclusionRepository: SessionConclusionRepositoryPort,
    private aiAnalyzer?: SessionAnalysisPort
  ) {}

  /**
   * Genera conclusión de sesión usando AI o fallback a reglas
   */
  async generateConclusion(
    analysis: SentimentAnalysis,
    metrics: SessionMetrics
  ): Promise<SessionConclusion> {
    let aiResponse: ConclusionAIResponse;

    // Estrategia AI-first con graceful degradation
    if (this.aiAnalyzer) {
      try {
        aiResponse = await this.generateWithAI(analysis, metrics);
      } catch (error) {
        console.warn('AI conclusion generation failed, falling back to rule-based approach:', error);
        aiResponse = this.generateWithRules(analysis, metrics);
      }
    } else {
      aiResponse = this.generateWithRules(analysis, metrics);
    }

    const conclusion = this.buildConclusion(analysis.id, aiResponse);
    return await this.conclusionRepository.save(conclusion);
  }

  /**
   * Genera conclusión usando análisis de IA (LLM)
   */
  private async generateWithAI(
    analysis: SentimentAnalysis,
    metrics: SessionMetrics
  ): Promise<ConclusionAIResponse> {
    if (!this.aiAnalyzer) {
      throw new Error('AI analyzer not available');
    }

    const response = await this.aiAnalyzer.analyzeConclusion({
      transcript: analysis.documentContent,
      overallSentiment: analysis.overallSentiment,
      confidence: analysis.confidence,
      metrics: metrics,
      clientName: analysis.clientName,
      documentName: analysis.documentName,
    });

    // Mapear respuesta de IA a ConclusionAIResponse (ya está en el formato correcto)
    return {
      executiveSummary: response.executiveSummary,
      risks: response.risks,
      opportunities: response.opportunities,
      actionPlan: response.actionPlan,
      insights: response.insights,
      teamClimate: response.teamClimate,
      satisfactionScore: response.satisfactionScore,
      recommendations: response.recommendations,
      nextSteps: response.nextSteps,
    };
  }

  private generateWithRules(
    analysis: SentimentAnalysis,
    metrics: SessionMetrics
  ): ConclusionAIResponse {
    const executiveSummary = this.generateExecutiveSummary(analysis, metrics);
    const risks = this.identifyRisks(analysis, metrics);
    const opportunities = this.identifyOpportunities(analysis, metrics);
    const actionPlan = this.generateActionPlan(metrics);
    const insights = this.generateInsights(analysis, metrics);
    const teamClimate = this.assessTeamClimate(analysis, metrics);
    const satisfactionScore = this.calculateSatisfactionScore(analysis, metrics);
    const recommendations = this.generateRecommendations(metrics);
    const nextSteps = this.generateNextSteps(metrics);

    return {
      executiveSummary,
      risks,
      opportunities,
      actionPlan,
      insights,
      teamClimate,
      satisfactionScore,
      recommendations,
      nextSteps,
    };
  }

  private generateExecutiveSummary(analysis: SentimentAnalysis, metrics: SessionMetrics): string {
    const sentimentText = analysis.overallSentiment === SentimentType.POSITIVE ? 'positiva' :
                         analysis.overallSentiment === SentimentType.NEUTRAL ? 'neutral' : 'negativa';

    const productivityLevel = metrics.productivityScore >= 80 ? 'alta' :
                             metrics.productivityScore >= 60 ? 'moderada' : 'baja';

    const blockersText = metrics.blockers.length > 0 ?
      `Se identificaron ${metrics.blockers.length} blocker(s) que requieren atención.` :
      'No se identificaron blockers significativos.';

    return `Sesión ${sentimentText} con productividad ${productivityLevel} (${metrics.productivityScore}/100). ` +
           `El equipo discutió ${metrics.topicsDiscussed.length} temas principales en ${metrics.duration} minutos. ` +
           blockersText;
  }

  private identifyRisks(analysis: SentimentAnalysis, metrics: SessionMetrics): Array<RiskItem> {
    const risks: Array<{ level: string; description: string; impact: string; recommendation: string }> = [];

    // High priority blockers are risks
    metrics.blockers.filter(b => b.priority === 'high').forEach(blocker => {
      risks.push({
        level: 'high',
        description: blocker.description,
        impact: 'Puede retrasar el progreso del proyecto',
        recommendation: 'Asignar recursos para resolver en 24-48 horas',
      });
    });

    // Low productivity is a risk
    if (metrics.productivityScore < 60) {
      risks.push({
        level: 'medium',
        description: 'Productividad por debajo del objetivo',
        impact: 'Reducción en velocidad de entrega',
        recommendation: 'Revisar procesos y eliminar impedimentos',
      });
    }

    // Too much time on problems
    if (metrics.problemsTimePercentage > 60) {
      risks.push({
        level: 'medium',
        description: 'Más del 60% del tiempo dedicado a problemas',
        impact: 'Poco tiempo para avances estratégicos',
        recommendation: 'Implementar pre-sesiones para resolver blockers',
      });
    }

    return risks.map(r => ({
      id: `risk-${uuidv4()}`,
      level: r.level as 'high' | 'medium' | 'low',
      description: r.description,
      impact: r.impact,
      recommendation: r.recommendation,
      detectedAt: new Date(),
    }));
  }

  private identifyOpportunities(analysis: SentimentAnalysis, metrics: SessionMetrics): Array<OpportunityItem> {
    const opportunities: Array<{ description: string; potentialValue: string; priority: string; effort: string }> = [];

    // High achievements are opportunities
    if (metrics.achievements.length >= 3) {
      opportunities.push({
        description: 'Múltiples logros alcanzados - usar para caso de éxito',
        potentialValue: 'Marketing y referencia para otros clientes',
        priority: 'high',
        effort: 'low',
      });
    }

    // High sentiment with high confidence
    if (analysis.overallSentiment === SentimentType.POSITIVE && analysis.confidence > 0.8) {
      opportunities.push({
        description: 'Cliente altamente satisfecho - oportunidad de upselling',
        potentialValue: 'Incremento en ARR del 20-30%',
        priority: 'high',
        effort: 'medium',
      });
    }

    // High engagement
    if (metrics.engagementScore > 80) {
      opportunities.push({
        description: 'Alta participación del equipo',
        potentialValue: 'Mayor velocidad en implementaciones futuras',
        priority: 'medium',
        effort: 'low',
      });
    }

    return opportunities.map(o => ({
      id: `opportunity-${uuidv4()}`,
      description: o.description,
      potentialValue: o.potentialValue,
      priority: o.priority as 'high' | 'medium' | 'low',
      effort: o.effort as 'low' | 'medium' | 'high',
    }));
  }

  private generateActionPlan(metrics: SessionMetrics): {
    immediate: Array<{ description: string; priority: string }>;
    shortTerm: Array<{ description: string; priority: string }>;
    continuous: Array<{ description: string; priority: string }>;
  } {
    const immediate: Array<{ description: string; priority: string }> = [];
    const shortTerm: Array<{ description: string; priority: string }> = [];
    const continuous: Array<{ description: string; priority: string }> = [];

    // Immediate actions from high priority blockers
    metrics.blockers.filter(b => b.priority === 'high').forEach(blocker => {
      immediate.push({
        description: `Resolver: ${blocker.description.substring(0, 100)}`,
        priority: 'high',
      });
    });

    // Short term actions from achievements
    if (metrics.achievements.length > 0) {
      shortTerm.push({
        description: 'Documentar y comunicar logros al equipo',
        priority: 'medium',
      });
    }

    // Continuous monitoring
    continuous.push({
      description: 'Monitorear progreso de acciones asignadas',
      priority: 'medium',
    });

    continuous.push({
      description: 'Mantener comunicación regular con stakeholders',
      priority: 'medium',
    });

    return {
      immediate: immediate.map(a => ({
        id: `action-${uuidv4()}`,
        description: a.description,
        priority: a.priority as 'high' | 'medium' | 'low',
        status: 'pending' as const,
      })),
      shortTerm: shortTerm.map(a => ({
        id: `action-${uuidv4()}`,
        description: a.description,
        priority: a.priority as 'high' | 'medium' | 'low',
        status: 'pending' as const,
      })),
      continuous: continuous.map(a => ({
        id: `action-${uuidv4()}`,
        description: a.description,
        priority: a.priority as 'high' | 'medium' | 'low',
        status: 'pending' as const,
      })),
    };
  }

  private generateInsights(analysis: SentimentAnalysis, metrics: SessionMetrics): BusinessInsights {
    const forAccountManager: string[] = [
      `Cliente muestra nivel de engagement ${metrics.engagementScore}/100`,
      metrics.blockers.length > 0 ? 'Existen blockers que requieren atención' : 'No hay blockers activos',
    ];

    const forTechnicalTeam: string[] = [
      `${metrics.blockers.length} blocker(s) técnico(s) identificado(s)`,
      `Productividad actual: ${metrics.productivityScore}/100`,
    ];

    const forManagement: string[] = [
      `Score general de sesión: ${metrics.productivityScore}/100`,
      `Sentiment del cliente: ${analysis.overallSentiment}`,
    ];

    if (metrics.achievements.length >= 3) {
      forManagement.push('Múltiples logros - considerar como caso de éxito');
    }

    return { forAccountManager, forTechnicalTeam, forManagement };
  }

  private assessTeamClimate(analysis: SentimentAnalysis, metrics: SessionMetrics): TeamClimate {
    const moral = analysis.overallSentiment === SentimentType.POSITIVE ? 85 :
                 analysis.overallSentiment === SentimentType.NEUTRAL ? 65 : 45;

    const collaboration = metrics.participantCount >= 5 ? 85 : 70;
    const proactivity = metrics.achievements.length >= 2 ? 80 : 60;
    const overall = Math.round((moral + collaboration + proactivity) / 3);

    return { moral, collaboration, proactivity, overall };
  }

  private calculateSatisfactionScore(analysis: SentimentAnalysis, metrics: SessionMetrics): number {
    let score = 50;

    // Based on sentiment
    if (analysis.overallSentiment === SentimentType.POSITIVE) score += 30;
    else if (analysis.overallSentiment === SentimentType.NEGATIVE) score -= 20;

    // Based on productivity
    score += (metrics.productivityScore - 50) * 0.3;

    // Penalize for blockers
    score -= metrics.blockers.length * 5;

    // Boost for achievements
    score += metrics.achievements.length * 5;

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  private generateRecommendations(metrics: SessionMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.productivityScore < 70) {
      recommendations.push('Implementar mejoras en procesos para aumentar productividad');
    }

    if (metrics.blockers.length > 0) {
      recommendations.push('Resolver blockers activos antes de la próxima sesión');
    }

    if (metrics.problemsTimePercentage > 50) {
      recommendations.push('Reducir tiempo dedicado a problemas con pre-sesiones de resolución');
    }

    return recommendations;
  }

  private generateNextSteps(metrics: SessionMetrics): string[] {
    const nextSteps: string[] = ['Revisar acciones asignadas en la sesión'];

    if (metrics.blockers.length > 0) {
      nextSteps.push('Seguimiento a resolución de blockers');
    }

    nextSteps.push('Agendar siguiente sesión de seguimiento');

    return nextSteps;
  }

  private buildConclusion(analysisId: string, aiResponse: ConclusionAIResponse): SessionConclusion {
    return new SessionConclusionEntity(
      `conclusion-${uuidv4()}`,
      analysisId,
      aiResponse.executiveSummary,
      aiResponse.satisfactionScore,
      aiResponse.risks.map(r => ({
        id: `risk-${uuidv4()}`,
        level: r.level as 'high' | 'medium' | 'low',
        description: r.description,
        impact: r.impact,
        recommendation: r.recommendation,
        detectedAt: new Date(),
      })),
      aiResponse.opportunities.map(o => ({
        id: `opportunity-${uuidv4()}`,
        description: o.description,
        potentialValue: o.potentialValue,
        priority: o.priority as 'high' | 'medium' | 'low',
        effort: o.effort as 'low' | 'medium' | 'high',
      })),
      {
        immediate: aiResponse.actionPlan.immediate.map(a => ({
          id: `action-${uuidv4()}`,
          description: a.description,
          priority: a.priority as 'high' | 'medium' | 'low',
          status: 'pending' as const,
        })),
        shortTerm: aiResponse.actionPlan.shortTerm.map(a => ({
          id: `action-${uuidv4()}`,
          description: a.description,
          priority: a.priority as 'high' | 'medium' | 'low',
          status: 'pending' as const,
        })),
        continuous: aiResponse.actionPlan.continuous.map(a => ({
          id: `action-${uuidv4()}`,
          description: a.description,
          priority: a.priority as 'high' | 'medium' | 'low',
          status: 'pending' as const,
        })),
      },
      aiResponse.insights,
      {
        ...aiResponse.teamClimate,
        overall: Math.round(
          (aiResponse.teamClimate.moral + aiResponse.teamClimate.collaboration + aiResponse.teamClimate.proactivity) / 3
        ),
      },
      aiResponse.satisfactionScore,
      aiResponse.recommendations,
      aiResponse.nextSteps,
      new Date(),
      new Date()
    );
  }

  async getConclusionByAnalysisId(analysisId: string): Promise<SessionConclusion | null> {
    return await this.conclusionRepository.findByAnalysisId(analysisId);
  }
}
