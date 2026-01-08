import { IDebtRepository } from '@/core/domain/ports/repositories/IDebtRepository';
import { Debt, DebtStatus, DebtType } from '@/core/domain/entities/debt/Debt';

export class InMemoryDebtRepository implements IDebtRepository {
  private debts: Map<string, Debt> = new Map();

  constructor() {
    this.seedDemoData();
  }

  private seedDemoData(): void {
    const userId = 'user-1'; // Main user for demo

    const demoDebts = [
      // CRITICAL: Overdue - past due date
      Debt.create({
        userId,
        type: DebtType.CREDIT_CARD,
        name: 'Banorte Oro',
        originalAmount: 20000,
        currentBalance: 12450,
        interestRate: 42,
        minimumPayment: 3450,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      }),
      // CRITICAL: Due today
      Debt.create({
        userId,
        type: DebtType.STORE_CREDIT,
        name: 'Liverpool',
        originalAmount: 15000,
        currentBalance: 9550,
        interestRate: 35,
        minimumPayment: 1850,
        dueDate: new Date(), // Today
      }),
      // HIGH: Due in 2 days
      Debt.create({
        userId,
        type: DebtType.PERSONAL_LOAN,
        name: 'BBVA Personal',
        originalAmount: 30000,
        currentBalance: 18000,
        interestRate: 28,
        minimumPayment: 2850,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      }),
      // MEDIUM: Due in 7 days
      Debt.create({
        userId,
        type: DebtType.AUTO_LOAN,
        name: 'Santander Auto',
        originalAmount: 120000,
        currentBalance: 45000,
        interestRate: 12,
        minimumPayment: 4800,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }),
      // MEDIUM: Due in 15 days
      Debt.create({
        userId,
        type: DebtType.MORTGAGE,
        name: 'Hipoteca Infonavit',
        originalAmount: 500000,
        currentBalance: 320000,
        interestRate: 10,
        minimumPayment: 8500,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      }),
      // MEDIUM: Due in 20 days
      Debt.create({
        userId,
        type: DebtType.STUDENT_LOAN,
        name: 'Crédito Educativo',
        originalAmount: 80000,
        currentBalance: 55000,
        interestRate: 8,
        minimumPayment: 1200,
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      }),
    ];

    demoDebts.forEach(debt => this.debts.set(debt.id, debt));
    console.log(`📦 InMemoryDebtRepository: Seeded ${demoDebts.length} demo debts for user ${userId}`);
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

