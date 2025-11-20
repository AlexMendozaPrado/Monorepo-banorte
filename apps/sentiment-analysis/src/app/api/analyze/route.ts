import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../infrastructure/di/DIContainer';
import { ApiResponse, AnalysisResponse } from '../../../shared/types/api';
import { getAIProviderConfig, validateAIProviderConfig } from '../../../config/ai-provider.config';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<AnalysisResponse>>> {
  try {
    // Validate AI provider configuration
    try {
      validateAIProviderConfig();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'AI provider configuration is invalid',
        },
        { status: 500 }
      );
    }

    // Initialize DI Container with AI provider configuration
    const container = DIContainer.getInstance(getAIProviderConfig());

    // Validate configuration
    const isConfigValid = await container.validateConfiguration();
    if (!isConfigValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Service configuration is invalid. Please check your environment variables.',
        },
        { status: 500 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clientName = formData.get('clientName') as string;
    const channel = formData.get('channel') as string;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided. Please upload a PDF file.',
        },
        { status: 400 }
      );
    }

    if (!clientName || clientName.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Client name is required.',
        },
        { status: 400 }
      );
    }

    if (!channel || channel.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Channel is required.',
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type. Only PDF files are supported.',
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Execute analysis use case
    const analyzeSentimentUseCase = container.analyzeSentimentUseCase;

    console.log('Starting sentiment analysis for:', {
      clientName: clientName.trim(),
      documentName: file.name,
      channel: channel.trim(),
      fileSize: fileBuffer.length
    });

    const result = await analyzeSentimentUseCase.execute({
      fileBuffer,
      clientName: clientName.trim(),
      documentName: file.name,
      channel: channel.trim(),
    });

    console.log('Sentiment analysis completed successfully');

    // Convert entity to API response format
    const analysisResponse: AnalysisResponse & { extendedAnalysis?: any } = {
      id: result.analysis.id,
      clientName: result.analysis.clientName,
      documentName: result.analysis.documentName,
      overallSentiment: result.analysis.overallSentiment,
      emotionScores: result.analysis.emotionScores,
      analysisMetrics: result.analysis.analysisMetrics,
      confidence: result.analysis.confidence,
      channel: result.analysis.channel,
      createdAt: result.analysis.createdAt.toISOString(),
      updatedAt: result.analysis.updatedAt.toISOString(),
      processingTimeMs: result.processingTimeMs,
      extendedAnalysis: result.extendedAnalysis, // NUEVO: Incluir análisis extendido
    };

    return NextResponse.json({
      success: true,
      data: analysisResponse,
      message: 'Analysis completed successfully',
    });

  } catch (error) {
    console.error('Analysis API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = errorMessage.includes('Invalid') || errorMessage.includes('required') ? 400 : 500;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to analyze documents.',
    },
    { status: 405 }
  );
}
