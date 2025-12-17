import { Budget } from '../../entities/financial/Budget';

export interface IBudgetRepository {
  save(budget: Budget): Promise<void>;
  findById(id: string): Promise<Budget | null>;
  findByUserAndMonth(userId: string, month: Date): Promise<Budget | null>;
  findByUser(userId: string, limit?: number): Promise<Budget[]>;
  delete(id: string): Promise<void>;
  existsForUserAndMonth(userId: string, month: Date): Promise<boolean>;
}

