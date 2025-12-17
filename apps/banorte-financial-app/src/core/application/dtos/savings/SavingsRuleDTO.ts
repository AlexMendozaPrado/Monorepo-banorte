export interface CreateSavingsRuleDTO {
  userId: string;
  goalId: string;
  name: string;
  type: 'ROUNDUP' | 'PERCENTAGE' | 'FIXED_AMOUNT' | 'CONDITIONAL';
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'PER_TRANSACTION';
  amount?: number;
  percentage?: number;
  currency?: string;
  active?: boolean;
}

export interface SavingsRuleDTO {
  id: string;
  userId: string;
  goalId: string;
  name: string;
  type: string;
  frequency: string;
  amount?: {
    amount: number;
    currency: string;
  };
  percentage?: number;
  active: boolean;
  executionCount: number;
  totalSaved: {
    amount: number;
    currency: string;
  };
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}
