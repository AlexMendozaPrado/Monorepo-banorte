import { IDebtRepository } from '@/core/domain/ports/repositories/IDebtRepository';
import { Debt, DebtStatus, DebtType } from '@/core/domain/entities/debt/Debt';

export class InMemoryDebtRepository implements IDebtRepository {
  private debts: Map<string, Debt> = new Map();

  constructor() {
    this.seedDemoData();
  }

  private seedDemoData(): void {
    const demoDebts = [
      Debt.create({
        userId: 'user-demo',
        type: DebtType.CREDIT_CARD,
        name: 'Banorte Oro',
        originalAmount: 20000,
        currentBalance: 12450,
        interestRate: 42,
        minimumPayment: 450,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }),
      Debt.create({
        userId: 'user-demo',
        type: DebtType.STORE_CREDIT,
        name: 'Liverpool',
        originalAmount: 15000,
        currentBalance: 9550,
        interestRate: 35,
        minimumPayment: 350,
        dueDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
      }),
      Debt.create({
        userId: 'user-demo',
        type: DebtType.PERSONAL_LOAN,
        name: 'BBVA Personal',
        originalAmount: 30000,
        currentBalance: 18000,
        interestRate: 28,
        minimumPayment: 850,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      }),
      Debt.create({
        userId: 'user-demo',
        type: DebtType.AUTO_LOAN,
        name: 'Santander Auto',
        originalAmount: 120000,
        currentBalance: 45000,
        interestRate: 12,
        minimumPayment: 1800,
        dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      }),
    ];

    demoDebts.forEach(debt => this.debts.set(debt.id, debt));
    console.log(`📦 InMemoryDebtRepository: Seeded ${demoDebts.length} demo debts`);
  }

  async save(debt: Debt): Promise<void> {
    this.debts.set(debt.id, debt);
  }

  async findById(id: string): Promise<Debt | null> {
    return this.debts.get(id) || null;
  }

  async findByUser(userId: string): Promise<Debt[]> {
    return Array.from(this.debts.values())
      .filter(d => d.userId === userId)
      .sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === DebtStatus.ACTIVE ? -1 : 1;
        }
        return b.interestRate - a.interestRate;
      });
  }

  async findByUserAndStatus(userId: string, status: DebtStatus): Promise<Debt[]> {
    return Array.from(this.debts.values())
      .filter(d => d.userId === userId && d.status === status);
  }

  async findByUserAndType(userId: string, type: DebtType): Promise<Debt[]> {
    return Array.from(this.debts.values())
      .filter(d => d.userId === userId && d.type === type);
  }

  async delete(id: string): Promise<void> {
    this.debts.delete(id);
  }

  async countByUser(userId: string): Promise<number> {
    return Array.from(this.debts.values())
      .filter(d => d.userId === userId).length;
  }

  clear(): void {
    this.debts.clear();
  }
}

