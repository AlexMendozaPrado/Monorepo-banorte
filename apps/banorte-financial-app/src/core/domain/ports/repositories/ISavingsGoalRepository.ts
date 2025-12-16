import { SavingsGoal, GoalStatus } from '../../entities/savings/SavingsGoal';

export interface ISavingsGoalRepository {
  save(goal: SavingsGoal): Promise<void>;
  findById(id: string): Promise<SavingsGoal | null>;
  findByUser(userId: string): Promise<SavingsGoal[]>;
  findByUserAndStatus(userId: string, status: GoalStatus): Promise<SavingsGoal[]>;
  delete(id: string): Promise<void>;
  countByUser(userId: string): Promise<number>;
}
