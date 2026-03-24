import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../../infrastructure/di/DIContainer';
import { ApiResponse, AnalysisResponse } from '../../../../shared/types/api';
import { getAIProviderConfig, validateAIProviderConfig } from '../../../../config/ai-provider.config';

// Marcar como dinámico para prevenir errores de generación estática
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<AnalysisResponse[]>>> {
  try {
    // Validar configuración del proveedor de IA
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

    // Inicializar contenedor de inyección de dependencias
    const container = DIContainer.getInstance(getAIProviderConfig());

    // Parsear parámetros de consulta
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const clientName = searchParams.get('clientName') || undefined;

    // Validar límite
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit must be between 1 and 50.',
        },
        { status: 400 }
      );
    }

    // Ejecutar caso de uso
    const getHistoricalAnalysisUseCase = container.getHistoricalAnalysisUseCase;
    const recentAnalyses = await getHistoricalAnalysisUseCase.getRecentAnalyses(clientName, limit);

    // Convertir entidades de dominio a formato de respuesta API
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
      processingTimeMs: 0, // No se almacena en datos históricos
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
