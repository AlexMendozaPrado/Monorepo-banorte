import { EmergencyFund } from '@/core/domain/entities/savings/EmergencyFund';
import { Money } from '@/core/domain/value-objects/financial/Money';

export interface CalculateEmergencyFundDTO {
  userId: string;
  monthlyExpenses: number;
  currentSavings: number;
  currency?: string;
  targetMonths?: number;
}

export class CalculateEmergencyFundUseCase {
  async execute(dto: CalculateEmergencyFundDTO) {
    const targetMonths = dto.targetMonths || 6;

    const fund = EmergencyFund.create({
      userId: dto.userId,
      monthlyExpenses: Money.fromAmount(dto.monthlyExpenses, (dto.currency || 'MXN') as any),
      currentAmount: Money.fromAmount(dto.currentSavings, (dto.currency || 'MXN') as any),
      targetMonths,
    });

    return fund.toJSON();
  }
}
