import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../../../infrastructure/di/DIContainer';
import {
  ApiResponse,
  SessionDashboardResponse,
  AnalysisResponse,
  SessionMetricsResponse,
  SessionConclusionResponse
} from '../../../../../shared/types/api';
import { getAIProviderConfig } from '../../../../../config/ai-provider.config';
import { SentimentAnalysis } from '../../../../../core/domain/entities/SentimentAnalysis';
import { SessionMetrics } from '../../../../../core/domain/entities/SessionMetrics';
import { SessionConclusion } from '../../../../../core/domain/value-objects/SessionConclusion';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<SessionDashboardResponse>>> {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Analysis ID is required',
        },
        { status: 400 }
      );
    }

    // Initialize DI Container
    const container = DIContainer.getInstance(getAIProviderConfig());

    // Get all components for the dashboard
    const analysisRepository = container.repository;
    const metricsService = container.sessionMetricsService;
    const conclusionService = container.sessionConclusionService;

    // 1. Get the sentiment analysis
    const analysis = await analysisRepository.findById(id);
    if (!analysis) {
      return NextResponse.json(
        {
          success: false,
          error: 'Analysis not found',
        },
        { status: 404 }
      );
    }

    // 2. Get the metrics
    const metrics = await metricsService.getMetricsByAnalysisId(id);
    if (!metrics) {
      return NextResponse.json(
        {
          success: false,
          error: 'Metrics not found for this analysis',
        },
        { status: 404 }
      );
    }

    // 3. Get the conclusion
    const conclusion = await conclusionService.getConclusionByAnalysisId(id);
    if (!conclusion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conclusion not found for this analysis',
        },
        { status: 404 }
      );
    }

    // 4. Optional: Get historical comparison (previous session + averages)
    const historicalComparison = await getHistoricalComparison(
      container,
      analysis,
      metrics
    );

    // Convert entities to API response format
    const dashboardResponse: SessionDashboardResponse = {
      analysis: convertAnalysisToResponse(analysis),
      metrics: convertMetricsToResponse(metrics),
      conclusion: convertConclusionToResponse(conclusion),
      historicalComparison,
    };

    return NextResponse.json({
      success: true,
      data: dashboardResponse,
      message: 'Dashboard data retrieved successfully',
    });

  } catch (error) {
    console.error('Get dashboard API error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

async function getHistoricalComparison(
  container: DIContainer,
  currentAnalysis: SentimentAnalysis,
  currentMetrics: SessionMetrics
): Promise<SessionDashboardResponse['historicalComparison']> {
  try {
    const analysisRepository = container.repository;
    const metricsService = container.sessionMetricsService;

    // Get all analyses for the same client, ordered by date
    const allAnalyses = await analysisRepository.findAll(
      { clientName: currentAnalysis.clientName },
      { page: 1, limit: 100, sortBy: 'createdAt', sortOrder: 'desc' }
    );

    // Find the previous session (the one before current)
    const currentIndex = allAnalyses.data.findIndex(a => a.id === currentAnalysis.id);
    const previousAnalysis = currentIndex < allAnalyses.data.length - 1
      ? allAnalyses.data[currentIndex + 1]
      : null;

    let previousSession: SessionMetricsResponse | undefined;
    if (previousAnalysis) {
      const prevMetrics = await metricsService.getMetricsByAnalysisId(previousAnalysis.id);
      if (prevMetrics) {
        previousSession = convertMetricsToResponse(prevMetrics);
      }
    }

    // Calculate averages across all sessions
    const allMetrics = await metricsService.getAllMetrics();
    const clientMetrics = allMetrics.filter(m => {
      // Filter by client name (need to match with analysis)
      return true; // Simplified for now
    });

    const averageProductivity = clientMetrics.length > 0
      ? clientMetrics.reduce((sum, m) => sum + m.productivityScore, 0) / clientMetrics.length
      : 0;

    const averageSentiment = clientMetrics.length > 0
      ? clientMetrics.reduce((sum, m) => {
          const timeline = m.emotionalTimeline;
          const avgSentiment = timeline.reduce((s, p) => s + p.sentiment, 0) / timeline.length;
          return sum + avgSentiment;
        }, 0) / clientMetrics.length
      : 0;

    const averageEffectiveness = clientMetrics.length > 0
      ? clientMetrics.reduce((sum, m) => sum + m.effectivenessScore, 0) / clientMetrics.length
      : 0;

    return {
      previousSession,
      averages: {
        productivity: Math.round(averageProductivity),
        sentiment: Math.round(averageSentiment * 10) / 10,
        effectiveness: Math.round(averageEffectiveness),
      },
    };

  } catch (error) {
    console.error('Error getting historical comparison:', error);
    return undefined;
  }
}

function convertAnalysisToResponse(analysis: SentimentAnalysis): AnalysisResponse {
  return {
    id: analysis.id,
    clientName: analysis.clientName,
    documentName: analysis.documentName,
    overallSentiment: analysis.overallSentiment,
    emotionScores: analysis.emotionScores,
    analysisMetrics: analysis.analysisMetrics,
    confidence: analysis.confidence,
    channel: analysis.channel,
    createdAt: analysis.createdAt.toISOString(),
    updatedAt: analysis.updatedAt.toISOString(),
    processingTimeMs: 0, // Not available in entity
  };
}

function convertMetricsToResponse(metrics: SessionMetrics): SessionMetricsResponse {
  return {
    id: metrics.id,
    analysisId: metrics.analysisId,
    duration: metrics.duration,
    participantCount: metrics.participantCount,
    topicsDiscussed: metrics.topicsDiscussed.map(topic => ({
      category: topic.category,
      topic: topic.topic,
      timeSpent: topic.timeSpent,
      sentiment: topic.sentiment,
      mentions: topic.mentions,
    })),
    problemsTimePercentage: metrics.problemsTimePercentage,
    achievementsTimePercentage: metrics.achievementsTimePercentage,
    coordinationTimePercentage: metrics.coordinationTimePercentage,
    productivityScore: metrics.productivityScore,
    effectivenessScore: metrics.effectivenessScore,
    resolutionRate: metrics.resolutionRate,
    engagementScore: metrics.engagementScore,
    blockers: metrics.blockers.map(blocker => ({
      id: blocker.id,
      description: blocker.description,
      priority: blocker.priority,
      status: blocker.status,
      mentions: blocker.mentions,
      firstMentioned: blocker.firstMentioned.toISOString(),
      lastMentioned: blocker.lastMentioned.toISOString(),
      context: blocker.context,
    })),
    achievements: metrics.achievements.map(achievement => ({
      id: achievement.id,
      description: achievement.description,
      metric: achievement.metric,
      value: achievement.value,
      sentiment: achievement.sentiment,
      impact: achievement.impact,
    })),
    actionItems: metrics.actionItems.map(action => ({
      id: action.id,
      description: action.description,
      assignee: action.assignee,
      deadline: action.deadline?.toISOString(),
      status: action.status,
      priority: action.priority,
    })),
    keywords: metrics.keywords.map(keyword => ({
      word: keyword.word,
      frequency: keyword.frequency,
      sentiment: keyword.sentiment,
      category: keyword.category,
    })),
    emotionalTimeline: metrics.emotionalTimeline.map(point => ({
      timestamp: point.timestamp,
      sentiment: point.sentiment,
      context: point.context,
      event: point.event,
      participants: point.participants,
    })),
    createdAt: metrics.createdAt.toISOString(),
    updatedAt: metrics.updatedAt.toISOString(),
  };
}

function convertConclusionToResponse(conclusion: SessionConclusion): SessionConclusionResponse {
  return {
    id: conclusion.id,
    analysisId: conclusion.analysisId,
    executiveSummary: conclusion.executiveSummary,
    overallScore: conclusion.overallScore,
    risks: conclusion.risks.map(risk => ({
      id: risk.id,
      level: risk.level,
      description: risk.description,
      impact: risk.impact,
      recommendation: risk.recommendation,
      detectedAt: risk.detectedAt.toISOString(),
    })),
    opportunities: conclusion.opportunities.map(opportunity => ({
      id: opportunity.id,
      description: opportunity.description,
      potentialValue: opportunity.potentialValue,
      priority: opportunity.priority,
      effort: opportunity.effort,
    })),
    actionPlan: {
      immediate: conclusion.actionPlan.immediate.map(action => ({
        id: action.id,
        description: action.description,
        assignee: action.assignee,
        deadline: action.deadline?.toISOString(),
        priority: action.priority,
        status: action.status,
      })),
      shortTerm: conclusion.actionPlan.shortTerm.map(action => ({
        id: action.id,
        description: action.description,
        assignee: action.assignee,
        deadline: action.deadline?.toISOString(),
        priority: action.priority,
        status: action.status,
      })),
      continuous: conclusion.actionPlan.continuous.map(action => ({
        id: action.id,
        description: action.description,
        assignee: action.assignee,
        deadline: action.deadline?.toISOString(),
        priority: action.priority,
        status: action.status,
      })),
    },
    insights: {
      forAccountManager: conclusion.insights.forAccountManager,
      forTechnicalTeam: conclusion.insights.forTechnicalTeam,
      forManagement: conclusion.insights.forManagement,
    },
    teamClimate: {
      moral: conclusion.teamClimate.moral,
      collaboration: conclusion.teamClimate.collaboration,
      proactivity: conclusion.teamClimate.proactivity,
      overall: conclusion.teamClimate.overall,
    },
    satisfactionScore: conclusion.satisfactionScore,
    recommendations: conclusion.recommendations,
    nextSteps: conclusion.nextSteps,
    createdAt: conclusion.createdAt.toISOString(),
    updatedAt: conclusion.updatedAt.toISOString(),
  };
}
