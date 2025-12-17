import { IFinancialAdvisorPort, FinancialContext } from '@/core/domain/ports/ai-services/IFinancialAdvisorPort';
import { Message } from '@/core/domain/entities/advisor/Message';
import { FinancialInsight, InsightType, InsightPriority } from '@/core/domain/entities/advisor/FinancialInsight';
import { BaseOpenAIService } from './BaseOpenAIService';
import {
  FINANCIAL_ADVISOR_SYSTEM_PROMPT,
  buildConversationContext,
  buildConversationHistory,
} from '../../prompts';

interface GenerateResponseOutput {
  response: string;
  suggestedQuestions: string[];
  relatedInsights?: string[];
}

interface FinancialInsightsOutput {
  insights: Array<{
    type: 'SPENDING_ALERT' | 'DEBT_WARNING' | 'SAVINGS_OPPORTUNITY' | 'BUDGET_RECOMMENDATION';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    actionableSteps: string[];
    potentialImpact: string;
  }>;
}

interface SpendingAnalysisOutput {
  patterns: Array<{
    category: string;
    trend: 'INCREASING' | 'DECREASING' | 'STABLE';
    recommendation: string;
  }>;
  overallHealth: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
}

interface PersonalizedAdviceOutput {
  advice: string;
  reasoning: string;
  nextSteps: string[];
}

export class OpenAIFinancialAdvisor extends BaseOpenAIService implements IFinancialAdvisorPort {
  async generateResponse(
    userMessage: string,
    conversationHistory: Message[],
    context: FinancialContext
  ): Promise<{
    response: string;
    suggestedQuestions: string[];
    relatedInsights?: string[];
  }> {
    const contextStr = buildConversationContext(context);
    const historyStr = buildConversationHistory(conversationHistory);

    const userPrompt = `${contextStr}${historyStr}

Usuario pregunta: "${userMessage}"

Responde en JSON con este formato:
{
  "response": "tu respuesta conversacional (máximo 200 palabras)",
  "suggestedQuestions": ["pregunta 1", "pregunta 2", "pregunta 3"],
  "relatedInsights": ["insight relevante 1", "insight 2"]
}`;

    const result = await this.callOpenAI<GenerateResponseOutput>({
      systemPrompt: FINANCIAL_ADVISOR_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.7, // Más creativo para conversación
      responseFormat: 'json_object',
    });

    return result.data;
  }

  async generateFinancialInsights(context: FinancialContext): Promise<FinancialInsight[]> {
    const contextStr = buildConversationContext(context);

    const userPrompt = `${contextStr}

Analiza la situación financiera del usuario y genera insights accionables.

Enfócate en:
1. Gastos vs ingreso (si gasto >80% del ingreso → SPENDING_ALERT)
2. Nivel de deuda (si deuda >50% ingreso anual → DEBT_WARNING)
3. Oportunidades de ahorro (si ahorros <3 meses gastos → SAVINGS_OPPORTUNITY)
4. Recomendaciones de presupuesto

Responde en JSON:
{
  "insights": [
    {
      "type": "SPENDING_ALERT" | "DEBT_WARNING" | "SAVINGS_OPPORTUNITY" | "BUDGET_RECOMMENDATION",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "title": "título corto",
      "description": "descripción clara del problema/oportunidad",
      "actionableSteps": ["paso 1", "paso 2", "paso 3"],
      "potentialImpact": "impacto estimado en pesos o porcentaje"
    }
  ]
}`;

    const result = await this.callOpenAI<FinancialInsightsOutput>({
      systemPrompt: FINANCIAL_ADVISOR_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.3,
      responseFormat: 'json_object',
    });

    // Convertir a entidades de dominio
    return result.data.insights.map(insight =>
      FinancialInsight.create({
        userId: context.userId,
        type: (InsightType as Record<string, InsightType>)[insight.type] || InsightType.SAVING_OPPORTUNITY,
        priority: (InsightPriority as Record<string, InsightPriority>)[insight.priority] || InsightPriority.MEDIUM,
        title: insight.title,
        description: insight.description,
        actionableSteps: insight.actionableSteps,
        potentialImpact: insight.potentialImpact,
      })
    );
  }

  async analyzeSpendingPattern(transactions: any[], budget: any) {
    const transactionsData = transactions.slice(0, 50).map(t => ({
      category: t.category || 'Sin categoría',
      amount: t.amount,
      date: t.date,
    }));

    const userPrompt = `Analiza estos ${transactionsData.length} transacciones y el presupuesto.

Transacciones:
${JSON.stringify(transactionsData, null, 2)}

Presupuesto total: $${budget?.totalIncome || 'N/A'}

Identifica patrones de gasto por categoría y evalúa salud financiera general.

Responde en JSON:
{
  "patterns": [
    {
      "category": "nombre categoría",
      "trend": "INCREASING" | "DECREASING" | "STABLE",
      "recommendation": "recomendación específica"
    }
  ],
  "overallHealth": "EXCELLENT" | "GOOD" | "WARNING" | "CRITICAL"
}`;

    const result = await this.callOpenAI<SpendingAnalysisOutput>({
      systemPrompt: FINANCIAL_ADVISOR_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.3,
      responseFormat: 'json_object',
    });

    return result.data;
  }

  async generatePersonalizedAdvice(question: string, context: FinancialContext) {
    const contextStr = buildConversationContext(context);

    const userPrompt = `${contextStr}

Pregunta específica del usuario: "${question}"

Proporciona consejo personalizado basado en su situación financiera.

Responde en JSON:
{
  "advice": "consejo principal (2-3 párrafos)",
  "reasoning": "por qué este consejo es apropiado para su situación",
  "nextSteps": ["acción concreta 1", "acción concreta 2", "acción concreta 3"]
}`;

    const result = await this.callOpenAI<PersonalizedAdviceOutput>({
      systemPrompt: FINANCIAL_ADVISOR_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.5,
      responseFormat: 'json_object',
    });

    return result.data;
  }
}
