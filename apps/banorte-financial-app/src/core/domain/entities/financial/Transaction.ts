import { v4 as uuidv4 } from 'uuid';
import { Money } from '../../value-objects/financial/Money';
import { ValidationException } from '../../exceptions';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface CreateTransactionData {
  userId: string;
  amount: Money;
  type: TransactionType;
  categoryId?: string;
  description: string;
  date: Date;
  merchant?: string;
  accountId?: string;
}

export class Transaction {
  private _status: TransactionStatus;
  private readonly createdAt: Date;

  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly amount: Money,
    public readonly type: TransactionType,
    public readonly categoryId: string | undefined,
    public readonly description: string,
    public readonly date: Date,
    public readonly merchant: string | undefined,
    public readonly accountId: string | undefined,
    status: TransactionStatus = TransactionStatus.COMPLETED
  ) {
    this._status = status;
    this.createdAt = new Date();
    this.validate();
  }

  static create(data: CreateTransactionData): Transaction {
    return new Transaction(
      uuidv4(),
      data.userId,
      data.amount,
      data.type,
      data.categoryId,
      data.description,
      data.date,
      data.merchant,
      data.accountId
    );
  }

  static reconstitute(
    id: string,
    userId: string,
    amount: Money,
    type: TransactionType,
    categoryId: string | undefined,
    description: string,
    date: Date,
    merchant: string | undefined,
    accountId: string | undefined,
    status: TransactionStatus,
    createdAt: Date
  ): Transaction {
    const transaction = new Transaction(
      id,
      userId,
      amount,
      type,
      categoryId,
      description,
      date,
      merchant,
      accountId,
      status
    );
    (transaction as any).createdAt = createdAt;
    return transaction;
  }

  cancel(): void {
    if (this._status === TransactionStatus.CANCELLED) {
      throw new ValidationException('Transaction is already cancelled');
    }
    this._status = TransactionStatus.CANCELLED;
  }

  complete(): void {
    if (this._status === TransactionStatus.COMPLETED) {
      throw new ValidationException('Transaction is already completed');
    }
    if (this._status === TransactionStatus.CANCELLED) {
      throw new ValidationException('Cannot complete a cancelled transaction');
    }
    this._status = TransactionStatus.COMPLETED;
  }

  isExpense(): boolean {
    return this.type === TransactionType.EXPENSE;
  }

  isIncome(): boolean {
    return this.type === TransactionType.INCOME;
  }

  isTransfer(): boolean {
    return this.type === TransactionType.TRANSFER;
  }

  isPending(): boolean {
    return this._status === TransactionStatus.PENDING;
  }

  isCompleted(): boolean {
    return this._status === TransactionStatus.COMPLETED;
  }

  isCancelled(): boolean {
    return this._status === TransactionStatus.CANCELLED;
  }

  get status(): TransactionStatus {
    return this._status;
  }

  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new ValidationException('User ID cannot be empty');
    }
    if (this.amount.isNegative()) {
      throw new ValidationException('Transaction amount cannot be negative');
    }
    if (!this.description || this.description.trim().length === 0) {
      throw new ValidationException('Description cannot be empty');
    }
    if (!(this.date instanceof Date) || isNaN(this.date.getTime())) {
      throw new ValidationException('Date must be a valid date');
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      amount: this.amount.toJSON(),
      type: this.type,
      categoryId: this.categoryId,
      description: this.description,
      date: this.date.toISOString(),
      merchant: this.merchant,
      accountId: this.accountId,
      status: this._status,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

