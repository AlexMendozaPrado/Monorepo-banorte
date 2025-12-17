import { SavingsRule } from '../../entities/savings/SavingsRule';

export interface ISavingsRuleRepository {
  save(rule: SavingsRule): Promise<void>;
  findById(id: string): Promise<SavingsRule | null>;
  findByUser(userId: string): Promise<SavingsRule[]>;
  findByGoal(goalId: string): Promise<SavingsRule[]>;
  findActiveByUser(userId: string): Promise<SavingsRule[]>;
  delete(id: string): Promise<void>;
}
