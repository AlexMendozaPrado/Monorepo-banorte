import { IBudgetRepository } from '@/core/domain/ports/repositories/IBudgetRepository';
import { Budget } from '@/core/domain/entities/financial/Budget';
import { BudgetCategory } from '@/core/domain/entities/financial/BudgetCategory';
import { Money } from '@/core/domain/value-objects/financial/Money';
import { BusinessRuleException } from '@/core/domain/exceptions';
import { CreateBudgetDTO, BudgetDTO } from '../../dtos/budget/CreateBudgetDTO';

export class CreateBudgetUseCase {
  constructor(
    private readonly budgetRepository: IBudgetRepository
  ) {}

  async execute(dto: CreateBudgetDTO): Promise<BudgetDTO> {
    // Check if budget already exists for this month
    const exists = await this.budgetRepository.existsForUserAndMonth(
      dto.userId,
      dto.month
    );
    
    if (exists) {
      throw new BusinessRuleException(
        'A budget already exists for this month',
        'BUDGET_ALREADY_EXISTS'
      );
    }

    // Create budget categories
    const categories = dto.categories.map(catData =>
      BudgetCategory.create({
        name: catData.name,
        budgeted: Money.fromAmount(catData.budgeted, (dto.currency as any) || 'MXN'),
        icon: catData.icon,
        color: catData.color,
      })
    );

    // Create budget
    const budget = Budget.create({
      userId: dto.userId,
      month: dto.month,
      totalIncome: Money.fromAmount(dto.totalIncome, (dto.currency as any) || 'MXN'),
      categories,
    });

    // Save budget
    await this.budgetRepository.save(budget);

    return budget.toJSON() as BudgetDTO;
  }
}

