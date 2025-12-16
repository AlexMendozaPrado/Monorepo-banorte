export interface SimulateSavingsDTO {
  goalId: string;
  monthlyContribution: number;
  months: number;
}

export interface SavingsSimulationResultDTO {
  finalAmount: {
    amount: number;
    currency: string;
  };
  completionDate: string;
  monthsToCompletion: number;
  successProbability: number;
  milestones: {
    month: number;
    amount: {
      amount: number;
      currency: string;
    };
    progress: number;
  }[];
}
