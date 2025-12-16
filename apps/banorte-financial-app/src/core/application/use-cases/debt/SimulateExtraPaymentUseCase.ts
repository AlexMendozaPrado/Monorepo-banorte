import { IDebtRepository } from '@/core/domain/ports/repositories/IDebtRepository';

export interface SimulateExtraPaymentDTO {
  debtId: string;
  extraPayment: number;
  currency?: string;
}

export class SimulateExtraPaymentUseCase {
  constructor(private readonly debtRepository: IDebtRepository) {}

  async execute(dto: SimulateExtraPaymentDTO) {
    const debt = await this.debtRepository.findById(dto.debtId);
    if (!debt) {
      throw new Error(`Debt not found: ${dto.debtId}`);
    }

    // Calcular escenario actual
    const currentPayment = debt.minimumPayment;
    const currentMonths = debt.calculateMonthsToPayoff(currentPayment);
    const currentInterest = debt.calculateTotalInterest(currentPayment);

    // Calcular escenario con pago extra
    const newPayment = currentPayment + dto.extraPayment;
    const newMonths = debt.calculateMonthsToPayoff(newPayment);
    const newInterest = debt.calculateTotalInterest(newPayment);

    if (currentMonths === null || currentInterest === null || newMonths === null || newInterest === null) {
      return {
        error: 'No se pudo calcular la simulación',
      };
    }

    const interestSaved = currentInterest - newInterest;
    const monthsSaved = currentMonths - newMonths;

    return {
      debtName: debt.name,
      current: {
        monthlyPayment: currentPayment,
        months: currentMonths,
        totalInterest: currentInterest,
      },
      withExtra: {
        monthlyPayment: newPayment,
        months: newMonths,
        totalInterest: newInterest,
      },
      savings: {
        interestSaved,
        monthsSaved,
        percentSaved: ((interestSaved / currentInterest) * 100).toFixed(2),
      },
    };
  }
}

