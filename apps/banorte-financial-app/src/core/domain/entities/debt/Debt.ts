export enum DebtType {
  CREDIT_CARD = 'CREDIT_CARD',
  PERSONAL_LOAN = 'PERSONAL_LOAN',
  MORTGAGE = 'MORTGAGE',
  AUTO_LOAN = 'AUTO_LOAN',
  STUDENT_LOAN = 'STUDENT_LOAN',
  STORE_CREDIT = 'STORE_CREDIT',
  OTHER = 'OTHER',
}

export enum DebtStatus {
  ACTIVE = 'ACTIVE',
  PAID_OFF = 'PAID_OFF',
  DEFAULT = 'DEFAULT',
}

export interface CreateDebtData {
  userId: string;
  type: DebtType;
  name: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: Date;
  currency?: string;
}

export class Debt {
  public readonly id: string;
  public readonly userId: string;
  public readonly type: DebtType;
  public readonly name: string;
  public readonly originalAmount: number;
  public currentBalance: number;
  public readonly interestRate: number;
  public readonly minimumPayment: number;
  public readonly dueDate: Date | undefined;
  public status: DebtStatus;
  public readonly currency: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  private constructor(data: {
    id: string;
    userId: string;
    type: DebtType;
    name: string;
    originalAmount: number;
    currentBalance: number;
    interestRate: number;
    minimumPayment: number;
    dueDate?: Date;
    status?: DebtStatus;
    currency?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.type = data.type;
    this.name = data.name;
    this.originalAmount = data.originalAmount;
    this.currentBalance = data.currentBalance;
    this.interestRate = data.interestRate;
    this.minimumPayment = data.minimumPayment;
    this.dueDate = data.dueDate;
    this.status = data.status || DebtStatus.ACTIVE;
    this.currency = data.currency || 'MXN';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static create(data: CreateDebtData): Debt {
    const id = `debt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return new Debt({
      id,
      userId: data.userId,
      type: data.type,
      name: data.name,
      originalAmount: data.originalAmount,
      currentBalance: data.currentBalance,
      interestRate: data.interestRate,
      minimumPayment: data.minimumPayment,
      dueDate: data.dueDate,
      currency: data.currency,
    });
  }

  static reconstitute(data: any): Debt {
    return new Debt({
      id: data.id,
      userId: data.userId,
      type: data.type as DebtType,
      name: data.name,
      originalAmount: data.originalAmount,
      currentBalance: data.currentBalance,
      interestRate: data.interestRate,
      minimumPayment: data.minimumPayment,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      status: data.status as DebtStatus,
      currency: data.currency,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    });
  }

  getProgress(): number {
    if (this.originalAmount === 0) return 0;
    const paid = this.originalAmount - this.currentBalance;
    return Math.min(Math.round((paid / this.originalAmount) * 100), 100);
  }

  getMonthlyInterest(): number {
    const monthlyRate = this.interestRate / 12 / 100;
    return this.currentBalance * monthlyRate;
  }

  calculateMonthsToPayoff(monthlyPayment: number): number | null {
    if (monthlyPayment <= this.getMonthlyInterest()) return null;
    if (this.currentBalance <= 0) return 0;
    
    let balance = this.currentBalance;
    const monthlyRate = this.interestRate / 12 / 100;
    let months = 0;

    while (balance > 0 && months < 600) {
      const interest = balance * monthlyRate;
      const principal = Math.min(monthlyPayment - interest, balance);
      if (principal <= 0) return null;
      balance -= principal;
      months++;
    }
    return months;
  }

  calculateTotalInterest(monthlyPayment: number): number | null {
    const months = this.calculateMonthsToPayoff(monthlyPayment);
    if (months === null) return null;
    
    let balance = this.currentBalance;
    const monthlyRate = this.interestRate / 12 / 100;
    let totalInterest = 0;

    for (let i = 0; i < months; i++) {
      const interest = balance * monthlyRate;
      totalInterest += interest;
      const principal = monthlyPayment - interest;
      balance -= principal;
    }
    return totalInterest;
  }

  isPastDue(): boolean {
    if (!this.dueDate || this.status !== DebtStatus.ACTIVE) return false;
    return new Date() > this.dueDate;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      name: this.name,
      originalAmount: this.originalAmount,
      currentBalance: this.currentBalance,
      interestRate: this.interestRate,
      minimumPayment: this.minimumPayment,
      dueDate: this.dueDate?.toISOString(),
      status: this.status,
      progress: this.getProgress(),
      monthlyInterest: this.getMonthlyInterest(),
      isPastDue: this.isPastDue(),
      currency: this.currency,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

