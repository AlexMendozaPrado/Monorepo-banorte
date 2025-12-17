import { ITransactionRepository, TransactionFilters } from '@/core/domain/ports/repositories/ITransactionRepository';
import { Transaction } from '@/core/domain/entities/financial/Transaction';
import { DateRange } from '@/core/domain/value-objects/common/DateRange';

export class InMemoryTransactionRepository implements ITransactionRepository {
  private transactions: Map<string, Transaction> = new Map();

  async save(transaction: Transaction): Promise<void> {
    this.transactions.set(transaction.id, transaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactions.get(id) || null;
  }

  async findByUser(userId: string, limit = 50): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  async findByFilters(filters: TransactionFilters): Promise<Transaction[]> {
    let results = Array.from(this.transactions.values())
      .filter(t => t.userId === filters.userId);

    if (filters.dateRange) {
      results = results.filter(t => filters.dateRange!.contains(t.date));
    }

    if (filters.categoryId) {
      results = results.filter(t => t.categoryId === filters.categoryId);
    }

    if (filters.type) {
      results = results.filter(t => t.type === filters.type);
    }

    if (filters.minAmount !== undefined) {
      results = results.filter(t => t.amount.amount >= filters.minAmount!);
    }

    if (filters.maxAmount !== undefined) {
      results = results.filter(t => t.amount.amount <= filters.maxAmount!);
    }

    if (filters.merchant) {
      const searchTerm = filters.merchant.toLowerCase();
      results = results.filter(t => 
        t.merchant?.toLowerCase().includes(searchTerm)
      );
    }

    return results.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async findByUserAndDateRange(userId: string, dateRange: DateRange): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.userId === userId && dateRange.contains(t.date))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async findByCategory(categoryId: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.categoryId === categoryId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async delete(id: string): Promise<void> {
    this.transactions.delete(id);
  }

  async countByUser(userId: string): Promise<number> {
    return Array.from(this.transactions.values())
      .filter(t => t.userId === userId).length;
  }

  // Helper methods for testing
  clear(): void {
    this.transactions.clear();
  }

  count(): number {
    return this.transactions.size;
  }
}

