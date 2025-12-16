import { v4 as uuidv4 } from 'uuid';
import { Money } from '../../value-objects/financial/Money';
import { Percentage } from '../../value-objects/financial/Percentage';
import { BudgetCategory } from './BudgetCategory';
import { ValidationException, BusinessRuleException } from '../../exceptions';

export interface CreateBudgetData {
  userId: string;
  month: Date;
  totalIncome: Money;
  categories: BudgetCategory[];
}

export class Budget {
  private _categories: Map<string, BudgetCategory> = new Map();
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly month: Date,
    public readonly totalIncome: Money,
    categories: BudgetCategory[] = []
  ) {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    categories.forEach(category => {
      this._categories.set(category.id, category);
    });
    this.validate();
  }

  static create(data: CreateBudgetData): Budget {
    return new Budget(
      uuidv4(),
      data.userId,
      data.month,
      data.totalIncome,
      data.categories
    );
  }

  static reconstitute(
    id: string,
    userId: string,
    month: Date,
    totalIncome: Money,
    categories: BudgetCategory[],
    createdAt: Date,
    updatedAt: Date
  ): Budget {
    const budget = new Budget(id, userId, month, totalIncome, categories);
    (budget as any).createdAt = createdAt;
    budget.updatedAt = updatedAt;
    return budget;
  }

  addCategory(category: BudgetCategory): void {
    if (this._categories.has(category.id)) {
      throw new BusinessRuleException('Category already exists in budget');
    }

    const sameName = Array.from(this._categories.values()).find(
      c => c.name.toLowerCase() === category.name.toLowerCase()
    );
    if (sameName) {
      throw new BusinessRuleException(
        `Category with name "${category.name}" already exists`
      );
    }

    this._categories.set(category.id, category);
    this.updatedAt = new Date();
  }

  removeCategory(categoryId: string): void {
    const category = this._categories.get(categoryId);
    if (!category) {
      throw new BusinessRuleException('Category not found in budget');
    }

    if (category.transactionCount > 0) {
      throw new BusinessRuleException(
        'Cannot remove category with existing transactions'
      );
    }

    this._categories.delete(categoryId);
    this.updatedAt = new Date();
  }

  getCategory(categoryId: string): BudgetCategory | undefined {
    return this._categories.get(categoryId);
  }

  getTotalBudgeted(): Money {
    return Array.from(this._categories.values()).reduce(
      (total, category) => total.add(category.budgeted),
      Money.zero()
    );
  }

  getTotalSpent(): Money {
    return Array.from(this._categories.values()).reduce(
      (total, category) => total.add(category.spent),
      Money.zero()
    );
  }

  getAvailable(): Money {
    return this.totalIncome.subtract(this.getTotalSpent());
  }

  getPercentageUsed(): Percentage {
    if (this.totalIncome.isZero()) {
      return Percentage.fromValue(0);
    }
    const percentage = (this.getTotalSpent().amount / this.totalIncome.amount) * 100;
    return Percentage.fromValue(Math.min(percentage, 100));
  }

  isOverBudget(): boolean {
    return this.getTotalSpent().isGreaterThan(this.totalIncome);
  }

  getCategoriesOverBudget(): BudgetCategory[] {
    return Array.from(this._categories.values()).filter(c => c.isOverBudget());
  }

  getCategoriesNearLimit(threshold: Percentage = Percentage.fromValue(80)): BudgetCategory[] {
    return Array.from(this._categories.values()).filter(c => 
      c.isNearLimit(threshold) && !c.isOverBudget()
    );
  }

  get categories(): readonly BudgetCategory[] {
    return Array.from(this._categories.values());
  }

  get categoryCount(): number {
    return this._categories.size;
  }

  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new ValidationException('User ID cannot be empty');
    }
    if (!(this.month instanceof Date) || isNaN(this.month.getTime())) {
      throw new ValidationException('Month must be a valid date');
    }
    if (this.totalIncome.isNegative()) {
      throw new ValidationException('Total income cannot be negative');
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      month: this.month.toISOString(),
      totalIncome: this.totalIncome.toJSON(),
      totalBudgeted: this.getTotalBudgeted().toJSON(),
      totalSpent: this.getTotalSpent().toJSON(),
      available: this.getAvailable().toJSON(),
      percentageUsed: this.getPercentageUsed().value,
      isOverBudget: this.isOverBudget(),
      categories: Array.from(this._categories.values()).map(c => c.toJSON()),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}

