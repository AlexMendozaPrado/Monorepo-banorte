export interface AntExpenseDTO {
  category: string;
  description: string;
  frequency: number;
  averageAmount: {
    amount: number;
    currency: string;
  };
  monthlyImpact: {
    amount: number;
    currency: string;
  };
  annualImpact: {
    amount: number;
    currency: string;
  };
  confidence: number;
  examples: {
    merchant: string;
    amount: {
      amount: number;
      currency: string;
    };
    date: string;
  }[];
  recommendation: string;
}

export interface AntExpensesAnalysisDTO {
  totalMonthlyImpact: {
    amount: number;
    currency: string;
  };
  totalAnnualImpact: {
    amount: number;
    currency: string;
  };
  detections: AntExpenseDTO[];
  overallRecommendation: string;
  potentialMonthlySavings: {
    amount: number;
    currency: string;
  };
}

