import { ISavingsGoalRepository } from '@/core/domain/ports/repositories/ISavingsGoalRepository';
import { ISavingsRuleRepository } from '@/core/domain/ports/repositories/ISavingsRuleRepository';
import { ISavingsOptimizerPort, SavingsOptimization } from '@/core/domain/ports/ai-services/ISavingsOptimizerPort';
import { Money } from '@/core/domain/value-objects/financial/Money';

export interface OptimizeSavingsDTO {
  userId: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  currency?: string;
}

export interface OptimizeSavingsResultDTO {
  totalMonthlySavings: { amount: number; currency: string };
  strategies: Array<{
    goalId: string;
    goalName: string;
    recommendedMonthlyContribution: { amount: number; currency: string };
    estimatedCompletionDate: string;
    reasoning: string;
    alternativeStrategies?: Array<{
      name: string;
      monthlyContribution: { amount: number; currency: string };
      completionMonths: number;
    }>;
  }>;
  suggestedRules: Array<{
    type: string;
    name: string;
    description: string;
    estimatedMonthlySavings: { amount: number; currency: string };
  }>;
  overallRecommendation: string;
}

export class OptimizeSavingsStrategyUseCase {
  constructor(
    private readonly savingsGoalRepository: ISavingsGoalRepository,
    private readonly savingsRuleRepository: ISavingsRuleRepository,
    private readonly savingsOptimizer: ISavingsOptimizerPort
  ) {}

  async execute(dto: OptimizeSavingsDTO): Promise<OptimizeSavingsResultDTO> {
    const currency = dto.currency || 'MXN';

    // Get user's savings goals
    const goals = await this.savingsGoalRepository.findByUserId(dto.userId);

    // Get user's current savings rules
    const rules = await this.savingsRuleRepository.findByUserId(dto.userId);

    // If no goals, return empty optimization with suggestions to create goals
    if (goals.length === 0) {
      return {
        totalMonthlySavings: { amount: 0, currency },
        strategies: [],
        suggestedRules: [],
        overallRecommendation:
          'Aún no tienes metas de ahorro. Crea tu primera meta para recibir recomendaciones personalizadas de Norma.',
      };
    }

    const monthlyIncome = Money.fromAmount(dto.monthlyIncome, currency);
    const monthlyExpenses = Money.fromAmount(dto.monthlyExpenses, currency);

    // Call AI optimizer
    const optimization = await this.savingsOptimizer.optimizeSavingsStrategy(
      goals,
      rules,
      monthlyIncome,
      monthlyExpenses
    );

    // Convert to DTO
    return {
      totalMonthlySavings: optimization.totalMonthlySavings.toJSON(),
      strategies: optimization.strategies.map(s => ({
        goalId: s.goalId,
        goalName: s.goalName,
        recommendedMonthlyContribution: s.recommendedMonthlyContribution.toJSON(),
        estimatedCompletionDate: s.estimatedCompletionDate.toISOString(),
        reasoning: s.reasoning,
        alternativeStrategies: s.alternativeStrategies?.map(alt => ({
          name: alt.name,
          monthlyContribution: alt.monthlyContribution.toJSON(),
          completionMonths: alt.completionMonths,
        })),
      })),
      suggestedRules: optimization.suggestedRules.map(r => ({
        type: r.type,
        name: r.name,
        description: r.description,
        estimatedMonthlySavings: r.estimatedMonthlySavings.toJSON(),
      })),
      overallRecommendation: optimization.overallRecommendation,
    };
  }
}
