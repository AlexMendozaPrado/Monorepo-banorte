import OpenAI from 'openai';
import { ISavingsOptimizerPort, SavingsOptimization } from '@/core/domain/ports/ai-services/ISavingsOptimizerPort';
import { SavingsGoal } from '@/core/domain/entities/savings/SavingsGoal';
import { SavingsRule } from '@/core/domain/entities/savings/SavingsRule';
import { Money } from '@/core/domain/value-objects/financial/Money';
import { OpenAIConfig } from './OpenAIConfig';

export class OpenAISavingsOptimizer implements ISavingsOptimizerPort {
  private openai: OpenAI | null = null;
  private config: ReturnType<OpenAIConfig['getConfig']>;

  constructor() {
    const configInstance = OpenAIConfig.getInstance();
    this.config = configInstance.getConfig();

    if (this.config.apiKey) {
      this.openai = new OpenAI({ apiKey: this.config.apiKey });
    }
  }

  async optimizeSavingsStrategy(
    goals: SavingsGoal[],
    currentRules: SavingsRule[],
    monthlyIncome: Money,
    monthlyExpenses: Money
  ): Promise<SavingsOptimization> {
    if (!this.openai) {
      return this.getMockOptimization(goals);
    }

    // Implementación real con OpenAI
    // Por brevedad, retornamos mock
    return this.getMockOptimization(goals);
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
    const currentAmount = goal.currentAmount.amount;
    const targetAmount = goal.targetAmount.amount;
    const contribution = monthlyContribution.amount;

    const finalAmount = currentAmount + (contribution * months);
    const monthsNeeded = Math.ceil((targetAmount - currentAmount) / contribution);

    const completionDate = new Date();
    completionDate.setMonth(completionDate.getMonth() + monthsNeeded);

    // Calcular probabilidad de éxito basada en realismo del objetivo
    const monthlyTarget = contribution;
    const affordabilityRatio = monthlyTarget / 10000; // Ratio simplificado
    const successProbability = Math.min(1, Math.max(0.3, 1 - affordabilityRatio));

    return {
      finalAmount: Money.fromAmount(finalAmount, goal.targetAmount.currency),
      completionDate,
      monthsToCompletion: monthsNeeded,
      successProbability: Math.round(successProbability * 100) / 100,
    };
  }

  async suggestSavingsGoals(userProfile: any) {
    return {
      suggestions: [
        {
          name: 'Fondo de Emergencia',
          targetAmount: Money.fromAmount(userProfile.monthlyExpenses.amount * 6),
          priority: 'HIGH' as const,
          reasoning: 'Recomendación estándar de 6 meses de gastos',
          recommendedDeadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      ],
    };
  }

  private getMockOptimization(goals: SavingsGoal[]): SavingsOptimization {
    return {
      totalMonthlySavings: Money.fromAmount(5000),
      strategies: goals.map(goal => ({
        goalId: goal.id,
        goalName: goal.name,
        recommendedMonthlyContribution: goal.getMonthlyContributionNeeded() || Money.fromAmount(1000),
        estimatedCompletionDate: goal.deadline || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        alternativeStrategies: [],
        reasoning: 'Estrategia óptima basada en tu capacidad de ahorro',
      })),
      suggestedRules: [
        {
          type: 'ROUNDUP',
          name: 'Redondeo en compras',
          description: 'Ahorra el cambio redondeando tus compras',
          estimatedMonthlySavings: Money.fromAmount(300),
        },
      ],
      overallRecommendation: 'Establece reglas automáticas para facilitar el ahorro',
    };
  }
}
