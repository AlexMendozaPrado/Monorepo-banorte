import { ISavingsRuleRepository } from '@/core/domain/ports/repositories/ISavingsRuleRepository';
import { SavingsRule } from '@/core/domain/entities/savings/SavingsRule';

export class InMemorySavingsRuleRepository implements ISavingsRuleRepository {
  private rules: Map<string, SavingsRule> = new Map();

  async save(rule: SavingsRule): Promise<void> {
    this.rules.set(rule.id, rule);
  }

  async findById(id: string): Promise<SavingsRule | null> {
    return this.rules.get(id) || null;
  }

  async findByUser(userId: string): Promise<SavingsRule[]> {
    return Array.from(this.rules.values())
      .filter(r => r.userId === userId);
  }

  async findByGoal(goalId: string): Promise<SavingsRule[]> {
    return Array.from(this.rules.values())
      .filter(r => r.goalId === goalId);
  }

  async findActiveByUser(userId: string): Promise<SavingsRule[]> {
    return Array.from(this.rules.values())
      .filter(r => r.userId === userId && r.active);
  }

  async delete(id: string): Promise<void> {
    this.rules.delete(id);
  }

  clear(): void {
    this.rules.clear();
  }
}
