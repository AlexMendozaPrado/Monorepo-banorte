import { NextRequest, NextResponse } from 'next/server';
import { getDIContainer } from '@/infrastructure/di/initialize';
import { GenerateProactiveInsightsUseCase } from '@/core/application/use-cases/advisor/GenerateProactiveInsightsUseCase';
import { InsightDomain } from '@/core/domain/entities/advisor/ProactiveInsight';

export const runtime = 'nodejs';
export const maxDuration = 30; // 30 segundos máximo

/**
 * GET /api/advisor/proactive-insights
 *
 * Genera insights proactivos para los dominios financieros especificados.
 *
 * Query params:
 * - userId: string (requerido) - ID del usuario
 * - domains: string (opcional) - Dominios separados por coma (BUDGET,SAVINGS,DEBT)
 * - monthlyIncome: number (opcional) - Ingreso mensual
 * - monthlyExpenses: number (opcional) - Gastos mensuales
 * - maxInsights: number (opcional) - Máximo de insights por dominio (default: 5)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     budget: InsightDTO[],
 *     savings: InsightDTO[],
 *     debt: InsightDTO[],
 *     generatedAt: string,
 *     meta: { totalInsights, urgentCount, processingTimeMs }
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);

    // Validar userId
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Parsear dominios
    const domainsParam = searchParams.get('domains');
    let domains: InsightDomain[] | undefined;

    if (domainsParam) {
      const domainNames = domainsParam.toUpperCase().split(',');
      const validDomains: InsightDomain[] = [];

      for (const name of domainNames) {
        const trimmed = name.trim();
        if (Object.values(InsightDomain).includes(trimmed as InsightDomain)) {
          validDomains.push(trimmed as InsightDomain);
        }
      }

      if (validDomains.length > 0) {
        domains = validDomains;
      }
    }

    // Parsear parámetros numéricos
    const monthlyIncome = searchParams.get('monthlyIncome')
      ? parseFloat(searchParams.get('monthlyIncome')!)
      : undefined;

    const monthlyExpenses = searchParams.get('monthlyExpenses')
      ? parseFloat(searchParams.get('monthlyExpenses')!)
      : undefined;

    const maxInsights = searchParams.get('maxInsights')
      ? parseInt(searchParams.get('maxInsights')!, 10)
      : 5;

    // Obtener use case del container
    const container = getDIContainer();
    const useCase = container.resolve<GenerateProactiveInsightsUseCase>(
      'GenerateProactiveInsightsUseCase'
    );

    // Ejecutar
    const result = await useCase.execute({
      userId,
      domains,
      monthlyIncome,
      monthlyExpenses,
      maxInsightsPerDomain: maxInsights,
    });

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        requestTime: Date.now() - startTime,
        cached: false,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';

    console.error('[API /advisor/proactive-insights] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        meta: {
          requestTime: Date.now() - startTime,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/advisor/proactive-insights
 *
 * Alternativa POST para enviar contexto más complejo en el body.
 *
 * Body:
 * {
 *   userId: string,
 *   domains?: InsightDomain[],
 *   monthlyIncome?: number,
 *   monthlyExpenses?: number,
 *   maxInsightsPerDomain?: number
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validar userId
    if (!body.userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Validar dominios si se proporcionan
    let domains: InsightDomain[] | undefined;
    if (body.domains && Array.isArray(body.domains)) {
      domains = body.domains.filter((d: string) =>
        Object.values(InsightDomain).includes(d as InsightDomain)
      ) as InsightDomain[];
    }

    // Obtener use case del container
    const container = getDIContainer();
    const useCase = container.resolve<GenerateProactiveInsightsUseCase>(
      'GenerateProactiveInsightsUseCase'
    );

    // Ejecutar
    const result = await useCase.execute({
      userId: body.userId,
      domains,
      monthlyIncome: body.monthlyIncome,
      monthlyExpenses: body.monthlyExpenses,
      maxInsightsPerDomain: body.maxInsightsPerDomain || 5,
    });

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        requestTime: Date.now() - startTime,
        cached: false,
      },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';

    console.error('[API /advisor/proactive-insights] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        meta: {
          requestTime: Date.now() - startTime,
        },
      },
      { status: 500 }
    );
  }
}
