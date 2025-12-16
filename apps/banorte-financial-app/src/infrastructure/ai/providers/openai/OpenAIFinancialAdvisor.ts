import { IFinancialAdvisorPort, FinancialContext } from '@/core/domain/ports/ai-services/IFinancialAdvisorPort';
import { Message } from '@/core/domain/entities/advisor/Message';
import { FinancialInsight, InsightType, InsightPriority } from '@/core/domain/entities/advisor/FinancialInsight';

export class OpenAIFinancialAdvisor implements IFinancialAdvisorPort {
  async generateResponse(
    userMessage: string,
    conversationHistory: Message[],
    context: FinancialContext
  ) {
    // Mock response - In production this would call OpenAI
    return this.getMockResponse(userMessage, context);
  }

  async generateFinancialInsights(context: FinancialContext): Promise<FinancialInsight[]> {
    const insights: FinancialInsight[] = [];

    // Insight: High spending
    if (context.monthlyExpenses && context.monthlyIncome) {
      const spendingRatio = (context.monthlyExpenses / context.monthlyIncome) * 100;
      if (spendingRatio > 80) {
        insights.push(
          FinancialInsight.create({
            userId: context.userId,
            type: InsightType.SPENDING_ALERT,
            priority: InsightPriority.HIGH,
            title: 'Gastos elevados este mes',
            description: `Estás gastando ${spendingRatio.toFixed(0)}% de tu ingreso mensual`,
            actionableSteps: [
              'Revisa tu presupuesto en detalle',
              'Identifica gastos no esenciales',
              'Establece límites por categoría',
            ],
            potentialImpact: `Reducir gastos en 20% te ahorraría $${((context.monthlyExpenses * 0.2).toFixed(0))} mensuales`,
          })
        );
      }
    }

    // Insight: Debt warning
    if (context.totalDebt && context.totalDebt > 0 && context.monthlyIncome) {
      const debtToIncome = (context.totalDebt / (context.monthlyIncome * 12)) * 100;
      if (debtToIncome > 50) {
        insights.push(
          FinancialInsight.create({
            userId: context.userId,
            type: InsightType.DEBT_WARNING,
            priority: InsightPriority.HIGH,
            title: 'Nivel de deuda alto',
            description: 'Tu deuda representa más del 50% de tu ingreso anual',
            actionableSteps: [
              'Evalúa opciones de consolidación',
              'Prioriza deudas con mayor interés',
              'Crea un plan de pago acelerado',
            ],
            potentialImpact: 'Reducir deudas mejorará tu score crediticio',
          })
        );
      }
    }

    return insights;
  }

  async analyzeSpendingPattern(transactions: any[], budget: any) {
    return {
      patterns: [
        {
          category: 'Alimentos',
          trend: 'STABLE' as const,
          recommendation: 'Tu gasto en alimentos se mantiene estable',
        },
      ],
      overallHealth: 'GOOD' as const,
    };
  }

  async generatePersonalizedAdvice(question: string, context: FinancialContext) {
    return {
      advice: 'Basado en tu situación financiera actual, te recomiendo...',
      reasoning: 'Considerando tu perfil e historial...',
      nextSteps: [
        'Paso 1: Analiza tu presupuesto',
        'Paso 2: Define metas claras',
        'Paso 3: Automatiza ahorros',
      ],
    };
  }

  private getMockResponse(userMessage: string, context: FinancialContext) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('gastos') || lowerMessage.includes('gasto')) {
      return {
        response: `He analizado tus gastos del mes. Estás gastando aproximadamente $${context.monthlyExpenses?.toLocaleString() || '18,500'} de un ingreso de $${context.monthlyIncome?.toLocaleString() || '35,000'}. Esto representa un 53% de tu ingreso, lo cual está dentro de un rango saludable. Sin embargo, noté algunos gastos hormiga que podrías optimizar.`,
        suggestedQuestions: [
          '¿Qué gastos hormiga detectaste?',
          '¿Cómo puedo reducir mis gastos?',
          'Muéstrame mi presupuesto',
        ],
      };
    }

    if (lowerMessage.includes('ahorro') || lowerMessage.includes('ahorrar')) {
      return {
        response: `¡Excelente pregunta! Basándome en tu perfil, tienes $${context.totalSavings?.toLocaleString() || '45,000'} en ahorros. Recomiendo que mantengas al menos 6 meses de gastos como fondo de emergencia ($90,000 en tu caso). Podrías automatizar un ahorro mensual del 10% de tu ingreso.`,
        suggestedQuestions: [
          '¿Cómo automatizo mis ahorros?',
          '¿Qué metas de ahorro debería tener?',
          'Muéstrame mis metas actuales',
        ],
      };
    }

    if (lowerMessage.includes('deuda') || lowerMessage.includes('deudas')) {
      return {
        response: `Actualmente tienes $${context.totalDebt?.toLocaleString() || '125,000'} en deudas. Te sugiero usar la estrategia "Avalancha" para pagar primero las deudas con mayor interés. Esto te ahorrará dinero a largo plazo en intereses.`,
        suggestedQuestions: [
          '¿Qué es la estrategia Avalancha?',
          '¿Cuánto debería pagar mensualmente?',
          'Muéstrame mis deudas',
        ],
      };
    }

    return {
      response: `Entiendo tu pregunta sobre: "${userMessage}". Basándome en tu situación financiera, te recomiendo revisar tu presupuesto mensual y establecer metas claras de ahorro. ¿Te gustaría que analicemos algún aspecto específico de tus finanzas?`,
      suggestedQuestions: [
        '¿Cómo puedo mejorar mi presupuesto?',
        '¿Cuánto debería ahorrar?',
        '¿Qué hago con mis deudas?',
      ],
    };
  }
}

