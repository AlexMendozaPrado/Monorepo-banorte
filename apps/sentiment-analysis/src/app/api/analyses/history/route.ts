import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../../infrastructure/di/DIContainer';
import { ApiResponse, HistoricalAnalysisResponse, HistoricalAnalysisRequest } from '../../../../shared/types/api';
import { SentimentType } from '../../../../core/domain/value-objects/SentimentType';
import { getAIProviderConfig, validateAIProviderConfig } from '../../../../config/ai-provider.config';

// Mark as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<HistoricalAnalysisResponse>>> {
  try {
    // Validate AI provider configuration
    try {
      validateAIProviderConfig();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service not configured properly.',
        },
        { status: 500 }
      );
    }

    // Initialize DI Container
    const container = DIContainer.getInstance(getAIProviderConfig());

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    
    const filters: HistoricalAnalysisRequest = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // Add optional filters
    const clientName = searchParams.get('clientName');
    if (clientName) filters.clientName = clientName;

    const sentimentType = searchParams.get('sentimentType');
    if (sentimentType && Object.values(SentimentType).includes(sentimentType as SentimentType)) {
      filters.sentimentType = sentimentType as SentimentType;
    }

    const channel = searchParams.get('channel');
    if (channel) filters.channel = channel;

    const dateFrom = searchParams.get('dateFrom');
    if (dateFrom) filters.dateFrom = dateFrom;

    const dateTo = searchParams.get('dateTo');
    if (dateTo) filters.dateTo = dateTo;

    const minConfidence = searchParams.get('minConfidence');
    if (minConfidence) filters.minConfidence = parseFloat(minConfidence);

    const maxConfidence = searchParams.get('maxConfidence');
    if (maxConfidence) filters.maxConfidence = parseFloat(maxConfidence);

    // Execute use case
    const getHistoricalAnalysisUseCase = container.getHistoricalAnalysisUseCase;
    
    // Convert API filters to domain filters
    const domainFilter: any = {};
    if (filters.clientName) domainFilter.clientName = filters.clientName;
    if (filters.sentimentType) domainFilter.sentimentType = filters.sentimentType;
    if (filters.channel) domainFilter.channel = filters.channel;
    if (filters.dateFrom) domainFilter.dateFrom = new Date(filters.dateFrom);
    if (filters.dateTo) domainFilter.dateTo = new Date(filters.dateTo);
    if (filters.minConfidence !== undefined) domainFilter.minConfidence = filters.minConfidence;
    if (filters.maxConfidence !== undefined) domainFilter.maxConfidence = filters.maxConfidence;

    const result = await getHistoricalAnalysisUseCase.execute({
      filter: domainFilter,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        sortBy: filters.sortBy as any,
        sortOrder: filters.sortOrder || 'desc',
      },
    });

    // Convert domain entities to API response format
    const response: HistoricalAnalysisResponse = {
      analyses: {
        data: result.analyses.data.map(analysis => ({
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
          processingTimeMs: 0, // Not stored in historical data
        })),
        total: result.analyses.total,
        page: result.analyses.page,
        limit: result.analyses.limit,
        totalPages: result.analyses.totalPages,
      },
      statistics: result.statistics,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('History API error:', error);
    
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
