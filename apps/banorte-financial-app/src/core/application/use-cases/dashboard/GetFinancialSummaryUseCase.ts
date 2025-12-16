export class GetFinancialSummaryUseCase {
  async execute(userId: string) {
    // Mock data - In real app, this would fetch from repositories
    const totalIncome = 35000;
    const totalExpenses = 18500;
    const totalSavings = 45000;
    const totalDebt = 125000;
    const totalInsuranceCoverage = 5000000;

    const netWorth = totalSavings - totalDebt;
    const monthlyFlow = totalIncome - totalExpenses;

    // Calculate health score
    const budgetPercentage = (totalExpenses / totalIncome) * 100;
    const debtToIncome = (totalDebt / (totalIncome * 12)) * 100;
    const savingsRate = (totalSavings / (totalIncome * 6)) * 100;
    
    const healthScore = this.calculateHealthScore({
      budgetPercentage,
      debtToIncome,
      savingsRate,
      goalsProgress: 65,
    });

    return {
      summary: {
        netWorth: { amount: netWorth, currency: 'MXN' },
        monthlyFlow: { amount: monthlyFlow, currency: 'MXN' },
        totalIncome: { amount: totalIncome, currency: 'MXN' },
        totalExpenses: { amount: totalExpenses, currency: 'MXN' },
        totalSavings: { amount: totalSavings, currency: 'MXN' },
        totalDebt: { amount: totalDebt, currency: 'MXN' },
        totalInsuranceCoverage: { amount: totalInsuranceCoverage, currency: 'MXN' },
      },
      counts: {
        activeBudgets: 1,
        activeSavingsGoals: 3,
        activeCards: 2,
        activeDebts: 2,
        activeInsurances: 2,
      },
      healthScore: {
        overall: healthScore,
        status: this.getHealthStatus(healthScore),
        breakdown: {
          budgetManagement: Math.max(0, 100 - budgetPercentage),
          debtManagement: Math.max(0, 100 - Math.min(100, debtToIncome)),
          savingsProgress: Math.min(100, savingsRate),
        },
      },
    };
  }

  private calculateHealthScore(factors: {
    budgetPercentage: number;
    debtToIncome: number;
    savingsRate: number;
    goalsProgress: number;
  }): number {
    const budgetScore = Math.max(0, 100 - factors.budgetPercentage);
    const debtScore = Math.max(0, 100 - Math.min(100, factors.debtToIncome));
    const savingsScore = Math.min(100, factors.savingsRate);
    const goalsScore = factors.goalsProgress;

    const weighted =
      budgetScore * 0.3 +
      debtScore * 0.3 +
      savingsScore * 0.2 +
      goalsScore * 0.2;

    return Math.round(weighted);
  }

  private getHealthStatus(score: number): 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' {
    if (score >= 80) return 'EXCELLENT';
    if (score >= 60) return 'GOOD';
    if (score >= 40) return 'FAIR';
    return 'POOR';
  }
}

