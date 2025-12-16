import { IBudgetRepository } from '@/core/domain/ports/repositories/IBudgetRepository';
import { Budget } from '@/core/domain/entities/financial/Budget';

export class InMemoryBudgetRepository implements IBudgetRepository {
  private budgets: Map<string, Budget> = new Map();

  async save(budget: Budget): Promise<void> {
    this.budgets.set(budget.id, budget);
  }

  async findById(id: string): Promise<Budget | null> {
    return this.budgets.get(id) || null;
  }

  async findByUserAndMonth(userId: string, month: Date): Promise<Budget | null> {
    const monthKey = `${month.getFullYear()}-${month.getMonth()}`;
    
    for (const budget of this.budgets.values()) {
      if (budget.userId === userId) {
        const budgetMonthKey = `${budget.month.getFullYear()}-${budget.month.getMonth()}`;
        if (budgetMonthKey === monthKey) {
          return budget;
        }
      }
    }
    
    return null;
  }

  async findByUser(userId: string, limit = 10): Promise<Budget[]> {
    const userBudgets = Array.from(this.budgets.values())
      .filter(b => b.userId === userId)
      .sort((a, b) => b.month.getTime() - a.month.getTime())
      .slice(0, limit);
    
    return userBudgets;
  }

  async delete(id: string): Promise<void> {
    this.budgets.delete(id);
  }

  async existsForUserAndMonth(userId: string, month: Date): Promise<boolean> {
    const budget = await this.findByUserAndMonth(userId, month);
    return budget !== null;
  }

  // Helper methods for testing
  clear(): void {
    this.budgets.clear();
  }

  count(): number {
    return this.budgets.size;
  }
}

