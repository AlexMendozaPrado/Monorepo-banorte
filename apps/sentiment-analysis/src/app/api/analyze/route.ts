import { NextRequest, NextResponse } from 'next/server';
import { DIContainer } from '../../../infrastructure/di/DIContainer';
import { ApiResponse, AnalysisResponse, SessionMetricsResponse, SessionConclusionResponse } from '../../../shared/types/api';
import { getAIProviderConfig, validateAIProviderConfig } from '../../../config/ai-provider.config';
import { SessionMetrics } from '../../../core/domain/entities/SessionMetrics';
import { SessionConclusion } from '../../../core/domain/value-objects/SessionConclusion';

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
    console.log(`[ANALYZE] Analysis ID: ${result.analysis.id}`);

    // Calculate session metrics automatically
    console.log('[ANALYZE] Calculating session metrics...');
    const metricsService = container.sessionMetricsService;
    const metrics = await metricsService.calculateSessionMetrics(result.analysis);
    console.log(`[ANALYZE] Session metrics calculated successfully - Metrics ID: ${metrics.id}, Analysis ID: ${metrics.analysisId}`);

    // Generate session conclusion
    console.log('[ANALYZE] Generating session conclusion...');
    const conclusionService = container.sessionConclusionService;
    const conclusion = await conclusionService.generateConclusion(result.analysis, metrics);
    console.log(`[ANALYZE] Session conclusion generated successfully - Conclusion ID: ${conclusion.id}, Analysis ID: ${conclusion.analysisId}`);

    // Convert entity to API response format (including metrics and conclusion)
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
      extendedAnalysis: result.extendedAnalysis,
      // Include metrics and conclusion in single response for Vercel compatibility
      metrics: convertMetricsToResponse(metrics),
      conclusion: convertConclusionToResponse(conclusion),
    };

    console.log('[ANALYZE] Response includes analysis, metrics, and conclusion');

    return NextResponse.json({
      success: true,
      data: analysisResponse,
      message: 'Analysis completed successfully with metrics and conclusion',
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

// Helper function to convert SessionMetrics entity to API response format
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

// Helper function to convert SessionConclusion entity to API response format
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
