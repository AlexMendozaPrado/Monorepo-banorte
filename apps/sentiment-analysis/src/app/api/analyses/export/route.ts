import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../../infrastructure/di/DIContainer';
import { ApiResponse, ExportRequest } from '../../../../shared/types/api';
import { SentimentType } from '../../../../core/domain/value-objects/SentimentType';
import { getAIProviderConfig, validateAIProviderConfig } from '../../../../config/ai-provider.config';

export async function POST(request: NextRequest): Promise<NextResponse> {
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

    // Parse request body
    const body: ExportRequest = await request.json();

    // Validate required fields
    if (!body.format || !['csv', 'json'].includes(body.format)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid format. Supported formats: csv, json',
        },
        { status: 400 }
      );
    }

    // Convert API filters to domain filters
    const domainFilter: any = {};
    if (body.filter) {
      if (body.filter.clientName) domainFilter.clientName = body.filter.clientName;
      if (body.filter.sentimentType) domainFilter.sentimentType = body.filter.sentimentType;
      if (body.filter.channel) domainFilter.channel = body.filter.channel;
      if (body.filter.dateFrom) domainFilter.dateFrom = new Date(body.filter.dateFrom);
      if (body.filter.dateTo) domainFilter.dateTo = new Date(body.filter.dateTo);
      if (body.filter.minConfidence !== undefined) domainFilter.minConfidence = body.filter.minConfidence;
      if (body.filter.maxConfidence !== undefined) domainFilter.maxConfidence = body.filter.maxConfidence;
    }

    // Execute export use case
    const exportAnalysisUseCase = container.exportAnalysisUseCase;
    const result = await exportAnalysisUseCase.execute({
      filter: domainFilter,
      exportOptions: {
        format: body.format,
        includeMetadata: body.includeMetadata || false,
        includeEmotionScores: body.includeEmotionScores || false,
        dateFormat: body.dateFormat || 'YYYY-MM-DD',
      },
    });

    // Return file as response
    const headers = new Headers();
    headers.set('Content-Type', result.exportResult.mimeType);
    headers.set('Content-Disposition', `attachment; filename="${result.exportResult.filename}"`);
    headers.set('Content-Length', result.exportResult.size.toString());

    // Convert data to appropriate format for NextResponse
    // NextResponse expects ReadableStream, string, or ArrayBuffer
    const responseData = Buffer.isBuffer(result.exportResult.data)
      ? new Uint8Array(result.exportResult.data)
      : result.exportResult.data;

    return new NextResponse(responseData, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Export API error:', error);
    
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

export async function GET(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to export analyses.',
    },
    { status: 405 }
  );
}
