import { ISavingsGoalRepository } from '@/core/domain/ports/repositories/ISavingsGoalRepository';
import { SavingsGoal, GoalStatus } from '@/core/domain/entities/savings/SavingsGoal';

export class InMemorySavingsGoalRepository implements ISavingsGoalRepository {
  private goals: Map<string, SavingsGoal> = new Map();

  async save(goal: SavingsGoal): Promise<void> {
    this.goals.set(goal.id, goal);
  }

  async findById(id: string): Promise<SavingsGoal | null> {
    return this.goals.get(id) || null;
  }

  async findByUser(userId: string): Promise<SavingsGoal[]> {
    return Array.from(this.goals.values())
      .filter(g => g.userId === userId)
      .sort((a, b) => {
        // Ordenar por prioridad y luego por fecha de creación
        const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        const diff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (diff !== 0) return diff;
        return new Date(b.toJSON().createdAt).getTime() - new Date(a.toJSON().createdAt).getTime();
      });
  }

  async findByUserAndStatus(userId: string, status: GoalStatus): Promise<SavingsGoal[]> {
    return Array.from(this.goals.values())
      .filter(g => g.userId === userId && g.status === status);
  }

  async delete(id: string): Promise<void> {
    this.goals.delete(id);
  }

  async countByUser(userId: string): Promise<number> {
    return Array.from(this.goals.values())
      .filter(g => g.userId === userId).length;
  }

  clear(): void {
    this.goals.clear();
  }
}
