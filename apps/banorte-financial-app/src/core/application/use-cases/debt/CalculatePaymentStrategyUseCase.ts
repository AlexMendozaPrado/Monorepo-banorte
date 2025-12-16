import { IDebtRepository } from '@/core/domain/ports/repositories/IDebtRepository';
import { PaymentStrategy, StrategyType } from '@/core/domain/entities/debt/PaymentStrategy';

export interface CalculateStrategyDTO {
  userId: string;
  availableMonthly: number;
  strategyType: 'AVALANCHE' | 'SNOWBALL' | 'BALANCED';
  currency?: string;
}

export class CalculatePaymentStrategyUseCase {
  constructor(private readonly debtRepository: IDebtRepository) {}

  async execute(dto: CalculateStrategyDTO) {
    const debts = await this.debtRepository.findByUser(dto.userId);
    const activeDebts = debts.filter(d => d.status === 'ACTIVE');

    if (activeDebts.length === 0) {
      return {
        message: 'No tienes deudas activas',
        strategy: null,
      };
    }

    let strategy: PaymentStrategy;

    switch (dto.strategyType) {
      case 'AVALANCHE':
        strategy = PaymentStrategy.calculateAvalanche(activeDebts, dto.availableMonthly);
        break;
      case 'SNOWBALL':
        strategy = PaymentStrategy.calculateSnowball(activeDebts, dto.availableMonthly);
        break;
      case 'BALANCED':
        strategy = PaymentStrategy.calculateBalanced(activeDebts, dto.availableMonthly);
        break;
      default:
        strategy = PaymentStrategy.calculateAvalanche(activeDebts, dto.availableMonthly);
    }

    return {
      strategy: strategy.toJSON(),
      activeDebtsCount: activeDebts.length,
    };
  }
}

