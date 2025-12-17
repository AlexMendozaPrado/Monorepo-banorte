import { ISavingsGoalRepository } from '@/core/domain/ports/repositories/ISavingsGoalRepository';
import { SavingsGoal, GoalPriority } from '@/core/domain/entities/savings/SavingsGoal';
import { Money } from '@/core/domain/value-objects/financial/Money';
import { CreateSavingsGoalDTO, SavingsGoalDTO } from '../../dtos/savings/SavingsGoalDTO';

export class CreateSavingsGoalUseCase {
  constructor(
    private readonly savingsGoalRepository: ISavingsGoalRepository
  ) {}

  async execute(dto: CreateSavingsGoalDTO): Promise<SavingsGoalDTO> {
    const goal = SavingsGoal.create({
      userId: dto.userId,
      name: dto.name,
      targetAmount: Money.fromAmount(dto.targetAmount, (dto.currency || 'MXN') as any),
      currentAmount: dto.currentAmount
        ? Money.fromAmount(dto.currentAmount, (dto.currency || 'MXN') as any)
        : undefined,
      deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      priority: dto.priority as GoalPriority,
      icon: dto.icon,
      color: dto.color,
    });

    await this.savingsGoalRepository.save(goal);

    return goal.toJSON() as SavingsGoalDTO;
  }
}
