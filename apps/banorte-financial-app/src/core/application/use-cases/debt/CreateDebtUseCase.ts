import { IDebtRepository } from '@/core/domain/ports/repositories/IDebtRepository';
import { Debt, DebtType } from '@/core/domain/entities/debt/Debt';

export interface CreateDebtDTO {
  userId: string;
  type: string;
  name: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: string;
  currency?: string;
}

export class CreateDebtUseCase {
  constructor(private readonly debtRepository: IDebtRepository) {}

  async execute(dto: CreateDebtDTO) {
    const debt = Debt.create({
      userId: dto.userId,
      type: dto.type as DebtType,
      name: dto.name,
      originalAmount: dto.originalAmount,
      currentBalance: dto.currentBalance,
      interestRate: dto.interestRate,
      minimumPayment: dto.minimumPayment,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      currency: dto.currency,
    });

    await this.debtRepository.save(debt);
    return debt.toJSON();
  }
}

