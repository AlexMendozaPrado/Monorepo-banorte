export interface CreateSavingsGoalDTO {
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount?: number;
  currency?: string;
  deadline?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  icon?: string;
  color?: string;
}

export interface SavingsGoalDTO {
  id: string;
  userId: string;
  name: string;
  targetAmount: {
    amount: number;
    currency: string;
  };
  currentAmount: {
    amount: number;
    currency: string;
  };
  remaining: {
    amount: number;
    currency: string;
  };
  progress: number;
  deadline?: string;
  priority: string;
  icon: string;
  color: string;
  status: string;
  isCompleted: boolean;
  isOverdue: boolean;
  daysRemaining: number | null;
  monthlyContributionNeeded: {
    amount: number;
    currency: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}
