import { ISavingsRuleRepository } from '@/core/domain/ports/repositories/ISavingsRuleRepository';
import { ISavingsGoalRepository } from '@/core/domain/ports/repositories/ISavingsGoalRepository';
import { SavingsRule, RuleType, RuleFrequency } from '@/core/domain/entities/savings/SavingsRule';
import { Money } from '@/core/domain/value-objects/financial/Money';
import { Percentage } from '@/core/domain/value-objects/financial/Percentage';
import { NotFoundException } from '@/core/domain/exceptions';
import { CreateSavingsRuleDTO, SavingsRuleDTO } from '../../dtos/savings/SavingsRuleDTO';

export class CreateSavingsRuleUseCase {
  constructor(
    private readonly savingsRuleRepository: ISavingsRuleRepository,
    private readonly savingsGoalRepository: ISavingsGoalRepository
  ) {}

  async execute(dto: CreateSavingsRuleDTO): Promise<SavingsRuleDTO> {
    // Verificar que la meta existe
    const goal = await this.savingsGoalRepository.findById(dto.goalId);
    if (!goal) {
      throw new NotFoundException('SavingsGoal', dto.goalId);
    }

    const rule = SavingsRule.create({
      userId: dto.userId,
      goalId: dto.goalId,
      name: dto.name,
      type: dto.type as RuleType,
      frequency: dto.frequency as RuleFrequency,
      amount: dto.amount
        ? Money.fromAmount(dto.amount, (dto.currency || 'MXN') as any)
        : undefined,
      percentage: dto.percentage
        ? Percentage.fromValue(dto.percentage)
        : undefined,
      active: dto.active,
    });

    await this.savingsRuleRepository.save(rule);

    return rule.toJSON() as SavingsRuleDTO;
  }
}
