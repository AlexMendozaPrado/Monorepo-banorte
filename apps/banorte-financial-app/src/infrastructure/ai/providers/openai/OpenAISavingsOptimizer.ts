import { ISavingsOptimizerPort, SavingsOptimization } from '@/core/domain/ports/ai-services/ISavingsOptimizerPort';
import { SavingsGoal } from '@/core/domain/entities/savings/SavingsGoal';
import { SavingsRule } from '@/core/domain/entities/savings/SavingsRule';
import { Money } from '@/core/domain/value-objects/financial/Money';
import { BaseOpenAIService } from './BaseOpenAIService';
import { SAVINGS_OPTIMIZER_SYSTEM_PROMPT } from '../../prompts';

interface OptimizeSavingsOutput {
  totalMonthlySavings: number;
  strategies: Array<{
    goalId: string;
    goalName: string;
    recommendedMonthlyContribution: number;
    estimatedCompletionMonths: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    reasoning: string;
    alternativeStrategies?: Array<{
      name: string;
      monthlyContribution: number;
      completionMonths: number;
    }>;
  }>;
  suggestedRules: Array<{
    type: 'ROUNDUP' | 'PERCENTAGE' | 'FIXED' | 'WINDFALL';
    name: string;
    description: string;
    estimatedMonthlySavings: number;
  }>;
  overallRecommendation: string;
}

interface SimulateSavingsOutput {
  finalAmount: number;
  monthsToCompletion: number;
  successProbability: number;
  reasoning: string;
  riskFactors: string[];
  recommendations: string[];
}

interface SuggestGoalsOutput {
  suggestions: Array<{
    name: string;
    targetAmount: number;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    reasoning: string;
    recommendedDeadlineMonths: number;
    estimatedMonthlyContribution: number;
  }>;
  priorityOrder: string[];
  overallStrategy: string;
}

export class OpenAISavingsOptimizer extends BaseOpenAIService implements ISavingsOptimizerPort {
  async optimizeSavingsStrategy(
    goals: SavingsGoal[],
    currentRules: SavingsRule[],
    monthlyIncome: Money,
    monthlyExpenses: Money
  ): Promise<SavingsOptimization> {
    const availableForSavings = monthlyIncome.amount - monthlyExpenses.amount;

    const goalsData = goals.map(g => ({
      id: g.id,
      name: g.name,
      targetAmount: g.targetAmount.amount,
      currentAmount: g.currentAmount.amount,
      deadline: g.deadline?.toISOString().split('T')[0],
      priority: g.priority,
    }));

    const rulesData = currentRules.map(r => ({
      type: r.type,
      isActive: r.active,
      totalSaved: r.totalSaved?.amount || 0,
    }));

    const userPrompt = `Optimiza la estrategia de ahorro para este usuario.

Contexto:
- Ingreso mensual: $${monthlyIncome.amount.toLocaleString('es-MX')}
- Gastos mensuales: $${monthlyExpenses.amount.toLocaleString('es-MX')}
- Disponible para ahorro: $${availableForSavings.toLocaleString('es-MX')}

Metas de ahorro:
${JSON.stringify(goalsData, null, 2)}

Reglas de ahorro actuales:
${JSON.stringify(rulesData, null, 2)}

Diseña una estrategia óptima que:
1. Priorice metas por urgencia y factibilidad
2. Distribuya el ahorro disponible de manera inteligente
3. Sugiera reglas automáticas para facilitar disciplina
4. Considere la inflación (~5% anual en México)

Responde en JSON:
{
  "totalMonthlySavings": monto_total_recomendado,
  "strategies": [
    {
      "goalId": "id",
      "goalName": "nombre",
      "recommendedMonthlyContribution": cantidad_mensual,
      "estimatedCompletionMonths": meses_para_completar,
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "reasoning": "por qué esta distribución",
      "alternativeStrategies": [
        {"name": "Plan agresivo", "monthlyContribution": X, "completionMonths": Y}
      ]
    }
  ],
  "suggestedRules": [
    {
      "type": "ROUNDUP" | "PERCENTAGE" | "FIXED" | "WINDFALL",
      "name": "nombre de la regla",
      "description": "descripción clara",
      "estimatedMonthlySavings": ahorro_estimado
    }
  ],
  "overallRecommendation": "recomendación general"
}`;

    const result = await this.callOpenAI<OptimizeSavingsOutput>({
      systemPrompt: SAVINGS_OPTIMIZER_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.3,
      responseFormat: 'json_object',
    });

    return {
      totalMonthlySavings: Money.fromAmount(result.data.totalMonthlySavings),
      strategies: result.data.strategies.map(s => ({
        goalId: s.goalId,
        goalName: s.goalName,
        recommendedMonthlyContribution: Money.fromAmount(s.recommendedMonthlyContribution),
        estimatedCompletionDate: this.calculateCompletionDate(s.estimatedCompletionMonths),
        alternativeStrategies: (s.alternativeStrategies || []).map((alt: any) => ({
          name: alt.name,
          monthlyContribution: Money.fromAmount(alt.monthlyContribution),
          completionDate: this.calculateCompletionDate(alt.completionMonths || 12),
          tradeoffs: alt.tradeoffs || 'Sin información de trade-offs',
        })),
        reasoning: s.reasoning,
      })),
      suggestedRules: result.data.suggestedRules.map(r => ({
        type: r.type,
        name: r.name,
        description: r.description,
        estimatedMonthlySavings: Money.fromAmount(r.estimatedMonthlySavings),
      })),
      overallRecommendation: result.data.overallRecommendation,
    };
  }

  async simulateSavingsImpact(
    goal: SavingsGoal,
    monthlyContribution: Money,
    months: number
  ): Promise<{
    finalAmount: Money;
    completionDate: Date;
    monthsToCompletion: number;
    successProbability: number;
  }> {
    const goalData = {
      name: goal.name,
      targetAmount: goal.targetAmount.amount,
      currentAmount: goal.currentAmount.amount,
      deadline: goal.deadline?.toISOString().split('T')[0],
    };

    const userPrompt = `Simula el impacto de ahorrar $${monthlyContribution.amount.toLocaleString('es-MX')}/mes durante ${months} meses para esta meta.

Meta:
${JSON.stringify(goalData, null, 2)}

Calcula:
1. Monto final acumulado (considera inflación 5% anual)
2. Meses necesarios para completar la meta
3. Probabilidad de éxito (0.0-1.0) basado en:
   - Realismo de la contribución mensual
   - Tiempo disponible vs tiempo necesario
   - Buffer para imprevistos
4. Factores de riesgo
5. Recomendaciones para aumentar probabilidad de éxito

Responde en JSON:
{
  "finalAmount": monto_final,
  "monthsToCompletion": meses_necesarios,
  "successProbability": probabilidad_0_a_1,
  "reasoning": "explicación del cálculo",
  "riskFactors": ["riesgo 1", "riesgo 2"],
  "recommendations": ["recomendación 1", "recomendación 2"]
}`;

    const result = await this.callOpenAI<SimulateSavingsOutput>({
      systemPrompt: SAVINGS_OPTIMIZER_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.2, // Muy analítico para simulaciones
      responseFormat: 'json_object',
    });

    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + result.data.monthsToCompletion);

    return {
      finalAmount: Money.fromAmount(result.data.finalAmount, goal.targetAmount.currency),
      completionDate,
      monthsToCompletion: result.data.monthsToCompletion,
      successProbability: Math.round(result.data.successProbability * 100) / 100,
    };
  }

  async suggestSavingsGoals(userProfile: any) {
    const profileData = {
      monthlyIncome: userProfile.monthlyIncome?.amount || 0,
      monthlyExpenses: userProfile.monthlyExpenses?.amount || 0,
      age: userProfile.age || 30,
      dependents: userProfile.dependents || 0,
      hasEmergencyFund: userProfile.hasEmergencyFund || false,
      currentSavings: userProfile.currentSavings?.amount || 0,
    };

    const userPrompt = `Sugiere metas de ahorro personalizadas para este perfil.

Perfil del usuario:
${JSON.stringify(profileData, null, 2)}

Considera:
1. Fondo de emergencia (3-6 meses de gastos) - SIEMPRE prioridad CRITICAL si no existe
2. Metas a corto plazo (<1 año): vacaciones, fondo para imprevistos
3. Metas a mediano plazo (1-5 años): enganche casa, auto, educación
4. Metas a largo plazo (>5 años): retiro, universidad hijos

Para cada meta sugerida, calcula:
- Monto objetivo realista
- Prioridad (CRITICAL/HIGH/MEDIUM/LOW)
- Deadline recomendado en meses
- Contribución mensual estimada

Responde en JSON:
{
  "suggestions": [
    {
      "name": "nombre de la meta",
      "targetAmount": monto_objetivo,
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "reasoning": "por qué esta meta es importante",
      "recommendedDeadlineMonths": meses_para_completar,
      "estimatedMonthlyContribution": contribución_mensual
    }
  ],
  "priorityOrder": ["nombre meta 1", "nombre meta 2"],
  "overallStrategy": "estrategia general recomendada"
}`;

    const result = await this.callOpenAI<SuggestGoalsOutput>({
      systemPrompt: SAVINGS_OPTIMIZER_SYSTEM_PROMPT,
      userPrompt,
      temperature: 0.3,
      responseFormat: 'json_object',
    });

    const recommendedDeadline = (months: number) => {
      const date = new Date();
      date.setMonth(date.getMonth() + months);
      return date;
    };

    const priorityMap: Record<string, 'HIGH' | 'MEDIUM' | 'LOW'> = {
      'CRITICAL': 'HIGH',
      'HIGH': 'HIGH',
      'MEDIUM': 'MEDIUM',
      'LOW': 'LOW',
    };

    return {
      suggestions: result.data.suggestions.map(s => ({
        name: s.name,
        targetAmount: Money.fromAmount(s.targetAmount),
        priority: priorityMap[s.priority] || 'MEDIUM',
        reasoning: s.reasoning,
        recommendedDeadline: recommendedDeadline(s.recommendedDeadlineMonths),
      })),
    };
  }

  // Helper method
  private calculateCompletionDate(months: number): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date;
  }
}
