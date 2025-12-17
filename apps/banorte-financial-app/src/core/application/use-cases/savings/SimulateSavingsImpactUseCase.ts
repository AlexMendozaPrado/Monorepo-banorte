import { ISavingsGoalRepository } from '@/core/domain/ports/repositories/ISavingsGoalRepository';
import { ISavingsOptimizerPort } from '@/core/domain/ports/ai-services/ISavingsOptimizerPort';
import { Money } from '@/core/domain/value-objects/financial/Money';
import { NotFoundException } from '@/core/domain/exceptions';
import { SimulateSavingsDTO, SavingsSimulationResultDTO } from '../../dtos/savings/SavingsSimulationDTO';

export class SimulateSavingsImpactUseCase {
  constructor(
    private readonly savingsGoalRepository: ISavingsGoalRepository,
    private readonly savingsOptimizer: ISavingsOptimizerPort
  ) {}

  async execute(dto: SimulateSavingsDTO): Promise<SavingsSimulationResultDTO> {
    const goal = await this.savingsGoalRepository.findById(dto.goalId);
    if (!goal) {
      throw new NotFoundException('SavingsGoal', dto.goalId);
    }

    const monthlyContribution = Money.fromAmount(
      dto.monthlyContribution,
      goal.targetAmount.currency
    );

    const result = await this.savingsOptimizer.simulateSavingsImpact(
      goal,
      monthlyContribution,
      dto.months
    );

    // Calcular milestones
    const milestones = [];
    for (let month = 1; month <= dto.months; month++) {
      const amount = goal.currentAmount.add(
        monthlyContribution.multiply(month)
      );
      const progress = (amount.amount / goal.targetAmount.amount) * 100;

      milestones.push({
        month,
        amount: amount.toJSON(),
        progress: Math.min(progress, 100),
      });
    }

    return {
      finalAmount: result.finalAmount.toJSON(),
      completionDate: result.completionDate.toISOString(),
      monthsToCompletion: result.monthsToCompletion,
      successProbability: result.successProbability,
      milestones,
    };
  }
}
