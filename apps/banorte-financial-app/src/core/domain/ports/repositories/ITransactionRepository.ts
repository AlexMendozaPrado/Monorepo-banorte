import { Transaction, TransactionType } from '../../entities/financial/Transaction';
import { DateRange } from '../../value-objects/common/DateRange';

export interface TransactionFilters {
  userId: string;
  dateRange?: DateRange;
  categoryId?: string;
  type?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
  merchant?: string;
}

export interface ITransactionRepository {
  save(transaction: Transaction): Promise<void>;
  findById(id: string): Promise<Transaction | null>;
  findByUser(userId: string, limit?: number): Promise<Transaction[]>;
  findByFilters(filters: TransactionFilters): Promise<Transaction[]>;
  findByUserAndDateRange(userId: string, dateRange: DateRange): Promise<Transaction[]>;
  findByCategory(categoryId: string): Promise<Transaction[]>;
  delete(id: string): Promise<void>;
  countByUser(userId: string): Promise<number>;
}

