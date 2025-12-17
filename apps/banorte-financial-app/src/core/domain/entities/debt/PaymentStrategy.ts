import { Debt } from './Debt';

export enum StrategyType {
  AVALANCHE = 'AVALANCHE',
  SNOWBALL = 'SNOWBALL',
  BALANCED = 'BALANCED',
}

export interface PaymentPlan {
  debtId: string;
  debtName: string;
  monthlyPayment: number;
  monthsToPayoff: number;
  totalInterest: number;
  priority: number;
}

export class PaymentStrategy {
  private constructor(
    public readonly type: StrategyType,
    public readonly totalMonthlyPayment: number,
    public readonly plans: PaymentPlan[],
    public readonly totalMonthsToPayoff: number,
    public readonly totalInterestSaved: number,
    public readonly reasoning: string
  ) {}

  static calculateAvalanche(debts: Debt[], availableMonthly: number): PaymentStrategy {
    const activeDebts = debts.filter(d => d.status === 'ACTIVE');
    const sortedDebts = [...activeDebts].sort((a, b) => b.interestRate - a.interestRate);
    
    const plans = this.distributePayments(sortedDebts, availableMonthly);
    const totalMonths = plans.length > 0 ? Math.max(...plans.map(p => p.monthsToPayoff)) : 0;
    const totalInterest = plans.reduce((sum, p) => sum + p.totalInterest, 0);

    return new PaymentStrategy(
      StrategyType.AVALANCHE,
      availableMonthly,
      plans,
      totalMonths,
      totalInterest,
      'Prioriza deudas con mayor interés para minimizar el costo total'
    );
  }

  static calculateSnowball(debts: Debt[], availableMonthly: number): PaymentStrategy {
    const activeDebts = debts.filter(d => d.status === 'ACTIVE');
    const sortedDebts = [...activeDebts].sort((a, b) => a.currentBalance - b.currentBalance);
    
    const plans = this.distributePayments(sortedDebts, availableMonthly);
    const totalMonths = plans.length > 0 ? Math.max(...plans.map(p => p.monthsToPayoff)) : 0;
    const totalInterest = plans.reduce((sum, p) => sum + p.totalInterest, 0);

    return new PaymentStrategy(
      StrategyType.SNOWBALL,
      availableMonthly,
      plans,
      totalMonths,
      totalInterest,
      'Prioriza deudas más pequeñas para victorias rápidas y motivación'
    );
  }

  static calculateBalanced(debts: Debt[], availableMonthly: number): PaymentStrategy {
    const activeDebts = debts.filter(d => d.status === 'ACTIVE');
    const sortedDebts = [...activeDebts].sort((a, b) => {
      const scoreA = (a.interestRate / 100) * 0.6 + (1 / a.currentBalance) * 0.4;
      const scoreB = (b.interestRate / 100) * 0.6 + (1 / b.currentBalance) * 0.4;
      return scoreB - scoreA;
    });
    
    const plans = this.distributePayments(sortedDebts, availableMonthly);
    const totalMonths = plans.length > 0 ? Math.max(...plans.map(p => p.monthsToPayoff)) : 0;
    const totalInterest = plans.reduce((sum, p) => sum + p.totalInterest, 0);

    return new PaymentStrategy(
      StrategyType.BALANCED,
      availableMonthly,
      plans,
      totalMonths,
      totalInterest,
      'Balance entre ahorro de intereses y victorias tempranas'
    );
  }

  private static distributePayments(sortedDebts: Debt[], availableMonthly: number): PaymentPlan[] {
    const plans: PaymentPlan[] = [];
    const minimumTotal = sortedDebts.reduce((sum, debt) => sum + debt.minimumPayment, 0);

    if (minimumTotal > availableMonthly) {
      sortedDebts.forEach((debt, index) => {
        const proportion = debt.minimumPayment / minimumTotal;
        const payment = availableMonthly * proportion;
        const months = debt.calculateMonthsToPayoff(payment) || 999;
        const totalInterest = debt.calculateTotalInterest(payment) || 0;
        
        plans.push({
          debtId: debt.id,
          debtName: debt.name,
          monthlyPayment: payment,
          monthsToPayoff: months,
          totalInterest,
          priority: index + 1,
        });
      });
    } else {
      const extraBudget = availableMonthly - minimumTotal;
      
      sortedDebts.forEach((debt, index) => {
        const basePayment = debt.minimumPayment;
        const extraPayment = index === 0 ? extraBudget : 0;
        const totalPayment = basePayment + extraPayment;
        
        const months = debt.calculateMonthsToPayoff(totalPayment) || 999;
        const totalInterest = debt.calculateTotalInterest(totalPayment) || 0;

        plans.push({
          debtId: debt.id,
          debtName: debt.name,
          monthlyPayment: totalPayment,
          monthsToPayoff: months,
          totalInterest,
          priority: index + 1,
        });
      });
    }
    return plans;
  }

  toJSON() {
    return {
      type: this.type,
      totalMonthlyPayment: this.totalMonthlyPayment,
      plans: this.plans,
      totalMonthsToPayoff: this.totalMonthsToPayoff,
      totalInterestSaved: this.totalInterestSaved,
      reasoning: this.reasoning,
    };
  }
}

