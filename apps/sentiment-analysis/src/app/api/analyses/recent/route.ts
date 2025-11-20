import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../../infrastructure/di/DIContainer';
import { ApiResponse, AnalysisResponse } from '../../../../shared/types/api';
import { getAIProviderConfig, validateAIProviderConfig } from '../../../../config/ai-provider.config';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<AnalysisResponse[]>>> {
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const clientName = searchParams.get('clientName') || undefined;

    // Validate limit
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit must be between 1 and 50.',
        },
        { status: 400 }
      );
    }

    // Execute use case
    const getHistoricalAnalysisUseCase = container.getHistoricalAnalysisUseCase;
    const recentAnalyses = await getHistoricalAnalysisUseCase.getRecentAnalyses(clientName, limit);

    // Convert domain entities to API response format
    const response: AnalysisResponse[] = recentAnalyses.map(analysis => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('Recent analyses API error:', error);
    
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
