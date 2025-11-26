import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../../infrastructure/di/DIContainer';
import { ApiResponse, SessionTrendsResponse, SessionTrendsRequest } from '../../../../shared/types/api';
import { getAIProviderConfig } from '../../../../config/ai-provider.config';
import { SessionTrends } from '../../../../core/domain/entities/SessionTrends';
import { AnalysisFilter } from '../../../../core/domain/ports/SentimentAnalysisRepositoryPort';

// Mark as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<SessionTrendsResponse>>> {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const clientName = searchParams.get('clientName');
    const channel = searchParams.get('channel');

    // Validate required parameters
    if (!from || !to) {
      return NextResponse.json(
        {
          success: false,
          error: 'Date range (from and to) is required. Format: YYYY-MM-DD',
        },
        { status: 400 }
      );
    }

    // Parse dates
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD',
        },
        { status: 400 }
      );
    }

    if (fromDate > toDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Start date (from) must be before end date (to)',
        },
        { status: 400 }
      );
    }

    // Build filter
    const filter: AnalysisFilter = {};
    if (clientName) filter.clientName = clientName;
    if (channel) filter.channel = channel;

    // Initialize DI Container
    const container = DIContainer.getInstance(getAIProviderConfig());
    const trendsService = container.sessionTrendsService;

    console.log('Calculating session trends for:', {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
      filter,
    });

    // Calculate trends
    const trends = await trendsService.calculateTrends(fromDate, toDate, filter);

    console.log('Session trends calculated successfully');

    // Convert entity to API response format
    const trendsResponse: SessionTrendsResponse = convertTrendsToResponse(trends);

    return NextResponse.json({
      success: true,
      data: trendsResponse,
      message: 'Session trends calculated successfully',
    });

  } catch (error) {
    console.error('Get trends API error:', error);

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

function convertTrendsToResponse(trends: SessionTrends): SessionTrendsResponse {
  return {
    id: trends.id,
    timeRange: {
      from: trends.timeRange.from.toISOString(),
      to: trends.timeRange.to.toISOString(),
    },
    sessionsCount: trends.sessionsCount,
    averageProductivity: trends.averageProductivity,
    averageSentiment: trends.averageSentiment,
    averageDuration: trends.averageDuration,
    totalParticipants: trends.totalParticipants,
    timeSeries: trends.timeSeries.map(point => ({
      date: point.date.toISOString(),
      productivityScore: point.productivityScore,
      sentimentScore: point.sentimentScore,
      blockersCount: point.blockersCount,
      achievementsCount: point.achievementsCount,
      duration: point.duration,
    })),
    npsEvolution: trends.npsEvolution.map(evolution => ({
      date: evolution.date.toISOString(),
      value: evolution.value,
      change: evolution.change,
      label: evolution.label,
    })),
    errorsEvolution: trends.errorsEvolution.map(evolution => ({
      date: evolution.date.toISOString(),
      value: evolution.value,
      change: evolution.change,
      label: evolution.label,
    })),
    velocityEvolution: trends.velocityEvolution.map(evolution => ({
      date: evolution.date.toISOString(),
      value: evolution.value,
      change: evolution.change,
    })),
    blockersEvolution: trends.blockersEvolution.map(evolution => ({
      date: evolution.date.toISOString(),
      value: evolution.value,
      change: evolution.change,
    })),
    recurringTopics: trends.recurringTopics.map(topic => ({
      topic: topic.topic,
      occurrences: topic.occurrences,
      averageSentiment: topic.averageSentiment,
      trend: topic.trend,
      status: topic.status,
      firstSeen: topic.firstSeen.toISOString(),
      lastSeen: topic.lastSeen.toISOString(),
    })),
    sentimentTrend: trends.sentimentTrend,
    productivityTrend: trends.productivityTrend,
    nextSessionProjection: {
      estimatedProductivity: trends.nextSessionProjection.estimatedProductivity,
      estimatedSentiment: trends.nextSessionProjection.estimatedSentiment,
      confidence: trends.nextSessionProjection.confidence,
    },
    mostProductiveDay: trends.mostProductiveDay,
    mostProductiveTimeOfDay: trends.mostProductiveTimeOfDay,
    averageBlockersPerSession: trends.averageBlockersPerSession,
    averageAchievementsPerSession: trends.averageAchievementsPerSession,
    createdAt: trends.createdAt.toISOString(),
  };
}
