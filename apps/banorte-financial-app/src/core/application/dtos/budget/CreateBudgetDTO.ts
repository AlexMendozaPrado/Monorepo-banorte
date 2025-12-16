export interface CreateBudgetDTO {
  userId: string;
  month: Date;
  totalIncome: number;
  currency?: string;
  categories: {
    name: string;
    budgeted: number;
    icon?: string;
    color?: string;
  }[];
}

export interface BudgetDTO {
  id: string;
  userId: string;
  month: string;
  totalIncome: {
    amount: number;
    currency: string;
  };
  totalBudgeted: {
    amount: number;
    currency: string;
  };
  totalSpent: {
    amount: number;
    currency: string;
  };
  available: {
    amount: number;
    currency: string;
  };
  percentageUsed: number;
  isOverBudget: boolean;
  categories: CategoryDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryDTO {
  id: string;
  name: string;
  budgeted: {
    amount: number;
    currency: string;
  };
  spent: {
    amount: number;
    currency: string;
  };
  remaining: {
    amount: number;
    currency: string;
  };
  percentageUsed: number;
  isOverBudget: boolean;
  icon: string;
  color: string;
  transactionCount: number;
}

