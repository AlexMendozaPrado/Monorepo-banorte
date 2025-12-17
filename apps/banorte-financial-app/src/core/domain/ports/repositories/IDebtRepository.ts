import { Debt, DebtStatus, DebtType } from '../../entities/debt/Debt';

export interface IDebtRepository {
  save(debt: Debt): Promise<void>;
  findById(id: string): Promise<Debt | null>;
  findByUser(userId: string): Promise<Debt[]>;
  findByUserAndStatus(userId: string, status: DebtStatus): Promise<Debt[]>;
  findByUserAndType(userId: string, type: DebtType): Promise<Debt[]>;
  delete(id: string): Promise<void>;
  countByUser(userId: string): Promise<number>;
}

