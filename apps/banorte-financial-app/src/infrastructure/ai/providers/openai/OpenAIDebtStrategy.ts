import { IDebtStrategyPort, DebtRecommendation } from '@/core/domain/ports/ai-services/IDebtStrategyPort';
import { Debt } from '@/core/domain/entities/debt/Debt';

export class OpenAIDebtStrategy implements IDebtStrategyPort {
  async analyzeDebtPortfolio(
    debts: Debt[],
    monthlyIncome: number,
    monthlyExpenses: number
  ) {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
    const debtToIncomeRatio = (totalDebt / monthlyIncome) * 100;

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (debtToIncomeRatio < 36) riskLevel = 'LOW';
    else if (debtToIncomeRatio < 50) riskLevel = 'MEDIUM';
    else if (debtToIncomeRatio < 80) riskLevel = 'HIGH';
    else riskLevel = 'CRITICAL';

    const recommendations = this.generateRecommendations(debts, debtToIncomeRatio);

    return {
      totalDebt,
      debtToIncomeRatio,
      riskLevel,
      recommendations,
    };
  }

  async suggestConsolidation(debts: Debt[]) {
    const totalDebt = debts.reduce((sum, debt) => sum + debt.currentBalance, 0);
    const avgRate = debts.reduce((sum, d) => sum + d.interestRate, 0) / debts.length;

    return {
      recommended: avgRate > 15 && debts.length >= 3,
      potentialNewLoan: {
        amount: totalDebt,
        rate: avgRate * 0.7,
        term: 60,
      },
      monthlySavings: 500,
      totalSavings: 30000,
      reasoning: 'La consolidación puede reducir tu tasa promedio y simplificar pagos',
    };
  }

  async optimizeExtraPayments(debts: Debt[], extraAmount: number) {
    const sortedDebts = [...debts].sort((a, b) => b.interestRate - a.interestRate);

    const allocations = sortedDebts.map((debt, index) => ({
      debtId: debt.id,
      amount: index === 0 ? extraAmount : 0,
      reasoning: index === 0 
        ? 'Mayor tasa de interés - máximo ahorro'
        : 'Mantener pagos mínimos',
      interestSaved: index === 0 ? 1000 : 0,
    }));

    return {
      allocations,
      totalInterestSaved: 1000,
    };
  }

  private generateRecommendations(
    debts: Debt[],
    debtToIncomeRatio: number
  ): DebtRecommendation[] {
    const recommendations: DebtRecommendation[] = [];

    if (debtToIncomeRatio > 50) {
      recommendations.push({
        type: 'CONSOLIDATION',
        priority: 'HIGH',
        title: 'Considera consolidar tus deudas',
        description: 'Tu ratio deuda-ingreso es alto. La consolidación puede ayudar.',
        potentialSavings: 5000,
        actionItems: [
          'Explora opciones de préstamos de consolidación',
          'Compara tasas con tu banco',
        ],
        estimatedTimeframe: '1-3 meses',
      });
    }

    const highInterestDebts = debts.filter(d => d.interestRate > 20);
    if (highInterestDebts.length > 0) {
      recommendations.push({
        type: 'REFINANCE',
        priority: 'HIGH',
        title: 'Refinancia deudas con alta tasa',
        description: `Tienes ${highInterestDebts.length} deuda(s) con tasas >20%`,
        potentialSavings: 3000,
        actionItems: [
          'Busca opciones de refinanciamiento',
          'Mejora tu score crediticio',
        ],
        estimatedTimeframe: '2-4 meses',
      });
    }

    return recommendations;
  }
}

