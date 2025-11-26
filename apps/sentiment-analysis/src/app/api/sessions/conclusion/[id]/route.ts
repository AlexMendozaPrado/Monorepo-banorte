import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../../../infrastructure/di/DIContainer';
import { ApiResponse, SessionConclusionResponse } from '../../../../../shared/types/api';
import { getAIProviderConfig } from '../../../../../config/ai-provider.config';
import { SessionConclusion } from '../../../../../core/domain/value-objects/SessionConclusion';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
): Promise<NextResponse<ApiResponse<SessionConclusionResponse>>> {
  try {
    // Await params if it's a Promise (Next.js 15+)
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    console.log(`[API] GET /api/sessions/conclusion/${id}`);

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
    const conclusionService = container.sessionConclusionService;

    console.log('[API] Getting conclusion from service...');
    // Get conclusion by analysis ID
    const conclusion = await conclusionService.getConclusionByAnalysisId(id);
    console.log(`[API] Conclusion result: ${conclusion ? 'found' : 'not found'}`);

    if (!conclusion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conclusion not found for the specified analysis ID',
        },
        { status: 404 }
      );
    }

    // Convert entity to API response format
    const conclusionResponse: SessionConclusionResponse = convertConclusionToResponse(conclusion);

    return NextResponse.json({
      success: true,
      data: conclusionResponse,
      message: 'Session conclusion retrieved successfully',
    });

  } catch (error) {
    console.error('Get conclusion API error:', error);

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
