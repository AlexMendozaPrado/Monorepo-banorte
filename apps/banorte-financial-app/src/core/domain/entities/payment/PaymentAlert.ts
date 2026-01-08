import { Debt, DebtType, DebtStatus } from '../debt/Debt';

export type AlertStatus = 'overdue' | 'urgent' | 'upcoming';
export type AlertPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM';

export interface PaymentAlertData {
  id: string;
  debtId: string;
  debtName: string;
  debtType: DebtType;
  dueDate: Date;
  daysUntilDue: number;
  minimumPayment: number;
  currentBalance: number;
  interestRate: number;
  currency: string;
  status: AlertStatus;
  priority: AlertPriority;
}

export class PaymentAlert {
  public readonly id: string;
  public readonly debtId: string;
  public readonly debtName: string;
  public readonly debtType: DebtType;
  public readonly dueDate: Date;
  public readonly daysUntilDue: number;
  public readonly minimumPayment: number;
  public readonly currentBalance: number;
  public readonly interestRate: number;
  public readonly currency: string;
  public readonly status: AlertStatus;
  public readonly priority: AlertPriority;

  private constructor(data: PaymentAlertData) {
    this.id = data.id;
    this.debtId = data.debtId;
    this.debtName = data.debtName;
    this.debtType = data.debtType;
    this.dueDate = data.dueDate;
    this.daysUntilDue = data.daysUntilDue;
    this.minimumPayment = data.minimumPayment;
    this.currentBalance = data.currentBalance;
    this.interestRate = data.interestRate;
    this.currency = data.currency;
    this.status = data.status;
    this.priority = data.priority;
  }

  /**
   * Creates a PaymentAlert from a Debt entity
   * Returns null if debt has no due date or is not active
   */
  static fromDebt(debt: Debt, referenceDate: Date = new Date()): PaymentAlert | null {
    if (!debt.dueDate || debt.status !== DebtStatus.ACTIVE) {
      return null;
    }

    const daysUntilDue = PaymentAlert.calculateDaysUntilDue(debt.dueDate, referenceDate);
    const status = PaymentAlert.determineStatus(daysUntilDue);
    const priority = PaymentAlert.determinePriority(daysUntilDue, debt.minimumPayment);

    return new PaymentAlert({
      id: `alert-${debt.id}`,
      debtId: debt.id,
      debtName: debt.name,
      debtType: debt.type,
      dueDate: debt.dueDate,
      daysUntilDue,
      minimumPayment: debt.minimumPayment,
      currentBalance: debt.currentBalance,
      interestRate: debt.interestRate,
      currency: debt.currency,
      status,
      priority,
    });
  }

  /**
   * Calculates days until due date (negative if overdue)
   */
  static calculateDaysUntilDue(dueDate: Date, referenceDate: Date = new Date()): number {
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const ref = new Date(referenceDate);
    ref.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - ref.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Determines alert status based on days until due
   * - overdue: past due date
   * - urgent: within 3 days
   * - upcoming: within 30 days
   */
  static determineStatus(daysUntilDue: number): AlertStatus {
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 3) return 'urgent';
    return 'upcoming';
  }

  /**
   * Determines priority based on urgency and amount
   * - CRITICAL: overdue or due today
   * - HIGH: 1-3 days or high amount (> $5000)
   * - MEDIUM: 4-30 days
   */
  static determinePriority(daysUntilDue: number, amount: number): AlertPriority {
    if (daysUntilDue <= 0) return 'CRITICAL';
    if (daysUntilDue <= 3 || amount > 5000) return 'HIGH';
    return 'MEDIUM';
  }

  /**
   * Checks if alert should be shown (within relevant timeframe)
   */
  isRelevant(maxDays: number = 30): boolean {
    return this.daysUntilDue <= maxDays;
  }

  /**
   * Gets a human-readable description of time until due
   */
  getTimeDescription(): string {
    if (this.daysUntilDue < 0) {
      const days = Math.abs(this.daysUntilDue);
      return days === 1 ? 'Vencido hace 1 día' : `Vencido hace ${days} días`;
    }
    if (this.daysUntilDue === 0) return 'Vence hoy';
    if (this.daysUntilDue === 1) return 'Vence mañana';
    if (this.daysUntilDue <= 7) return `Vence en ${this.daysUntilDue} días`;
    return `Vence el ${this.dueDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`;
  }

  /**
   * Gets formatted amount string
   */
  getFormattedAmount(): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: this.currency,
    }).format(this.minimumPayment);
  }

  /**
   * Converts to DTO for API responses
   */
  toDTO(): PaymentAlertDTO {
    return {
      id: this.id,
      debtId: this.debtId,
      debtName: this.debtName,
      debtType: this.debtType,
      dueDate: this.dueDate.toISOString(),
      daysUntilDue: this.daysUntilDue,
      minimumPayment: this.minimumPayment,
      currentBalance: this.currentBalance,
      interestRate: this.interestRate,
      currency: this.currency,
      status: this.status,
      priority: this.priority,
      timeDescription: this.getTimeDescription(),
      formattedAmount: this.getFormattedAmount(),
    };
  }

  /**
   * Compares alerts for sorting (most urgent first)
   */
  static compare(a: PaymentAlert, b: PaymentAlert): number {
    // Priority order: CRITICAL > HIGH > MEDIUM
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by days until due (ascending)
    return a.daysUntilDue - b.daysUntilDue;
  }
}

export interface PaymentAlertDTO {
  id: string;
  debtId: string;
  debtName: string;
  debtType: DebtType;
  dueDate: string;
  daysUntilDue: number;
  minimumPayment: number;
  currentBalance: number;
  interestRate: number;
  currency: string;
  status: AlertStatus;
  priority: AlertPriority;
  timeDescription: string;
  formattedAmount: string;
}

export interface PaymentAlertsSummary {
  total: number;
  overdue: number;
  urgent: number;
  upcoming: number;
  totalAmountDue: number;
}
