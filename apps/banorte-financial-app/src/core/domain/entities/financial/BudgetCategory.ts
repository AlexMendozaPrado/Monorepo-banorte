import { v4 as uuidv4 } from 'uuid';
import { Money } from '../../value-objects/financial/Money';
import { Percentage } from '../../value-objects/financial/Percentage';
import { ValidationException, BusinessRuleException } from '../../exceptions';

export interface CreateBudgetCategoryData {
  name: string;
  budgeted: Money;
  icon?: string;
  color?: string;
}

export class BudgetCategory {
  private _spent: Money;
  private _transactions: string[] = []; // Transaction IDs

  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly budgeted: Money,
    public readonly icon: string,
    public readonly color: string,
    spent: Money = Money.zero()
  ) {
    this._spent = spent;
    this.validate();
  }

  static create(data: CreateBudgetCategoryData): BudgetCategory {
    return new BudgetCategory(
      uuidv4(),
      data.name,
      data.budgeted,
      data.icon || '📊',
      data.color || '#5B6670',
      Money.zero()
    );
  }

  static reconstitute(
    id: string,
    name: string,
    budgeted: Money,
    spent: Money,
    icon: string,
    color: string,
    transactions: string[]
  ): BudgetCategory {
    const category = new BudgetCategory(id, name, budgeted, icon, color, spent);
    category._transactions = transactions;
    return category;
  }

  addTransaction(transactionId: string, amount: Money): void {
    if (amount.isNegative()) {
      throw new ValidationException('Transaction amount cannot be negative');
    }
    this._spent = this._spent.add(amount);
    this._transactions.push(transactionId);
  }

  removeTransaction(transactionId: string, amount: Money): void {
    const index = this._transactions.indexOf(transactionId);
    if (index === -1) {
      throw new BusinessRuleException('Transaction not found in category');
    }
    this._spent = this._spent.subtract(amount);
    this._transactions.splice(index, 1);
  }

  getRemaining(): Money {
    return this.budgeted.subtract(this._spent);
  }

  getPercentageUsed(): Percentage {
    if (this.budgeted.isZero()) {
      return Percentage.fromValue(0);
    }
    const percentage = (this._spent.amount / this.budgeted.amount) * 100;
    return Percentage.fromValue(Math.min(percentage, 100));
  }

  isOverBudget(): boolean {
    return this._spent.isGreaterThan(this.budgeted);
  }

  isNearLimit(threshold: Percentage = Percentage.fromValue(80)): boolean {
    return this.getPercentageUsed().isGreaterThan(threshold);
  }

  get spent(): Money {
    return this._spent;
  }

  get transactionCount(): number {
    return this._transactions.length;
  }

  get transactions(): readonly string[] {
    return this._transactions;
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new ValidationException('Category name cannot be empty');
    }
    if (this.name.length > 50) {
      throw new ValidationException('Category name cannot exceed 50 characters');
    }
    if (this.budgeted.isNegative()) {
      throw new ValidationException('Budgeted amount cannot be negative');
    }
    if (this._spent.isNegative()) {
      throw new ValidationException('Spent amount cannot be negative');
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      budgeted: this.budgeted.toJSON(),
      spent: this._spent.toJSON(),
      remaining: this.getRemaining().toJSON(),
      percentageUsed: this.getPercentageUsed().value,
      isOverBudget: this.isOverBudget(),
      icon: this.icon,
      color: this.color,
      transactionCount: this.transactionCount,
    };
  }
}

