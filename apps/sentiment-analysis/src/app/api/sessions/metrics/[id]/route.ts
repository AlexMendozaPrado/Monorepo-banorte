import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../../../infrastructure/di/DIContainer';
import { ApiResponse, SessionMetricsResponse } from '../../../../../shared/types/api';
import { getAIProviderConfig } from '../../../../../config/ai-provider.config';
import { SessionMetrics } from '../../../../../core/domain/entities/SessionMetrics';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ApiResponse<SessionMetricsResponse>>> {
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
    const metricsService = container.sessionMetricsService;

    // Get metrics by analysis ID
    const metrics = await metricsService.getMetricsByAnalysisId(id);

    if (!metrics) {
      return NextResponse.json(
        {
          success: false,
          error: 'Metrics not found for the specified analysis ID',
        },
        { status: 404 }
      );
    }

    // Convert entity to API response format
    const metricsResponse: SessionMetricsResponse = convertMetricsToResponse(metrics);

    return NextResponse.json({
      success: true,
      data: metricsResponse,
      message: 'Session metrics retrieved successfully',
    });

  } catch (error) {
    console.error('Get metrics API error:', error);

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
      deadline: action.deadline,
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
