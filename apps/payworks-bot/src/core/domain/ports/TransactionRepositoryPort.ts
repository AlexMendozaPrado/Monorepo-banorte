import { Transaction } from '../entities/Transaction';

export interface TransactionRepositoryPort {
  findByReferencia(referencia: string): Promise<Transaction | null>;
  findByReferences(referencias: string[]): Promise<Transaction[]>;
}
