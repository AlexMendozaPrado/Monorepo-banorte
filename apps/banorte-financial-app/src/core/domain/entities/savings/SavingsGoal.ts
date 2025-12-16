import { v4 as uuidv4 } from 'uuid';
import { Money } from '../../value-objects/financial/Money';
import { Percentage } from '../../value-objects/financial/Percentage';
import { ValidationException, BusinessRuleException } from '../../exceptions';

export enum GoalStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

export enum GoalPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface CreateSavingsGoalData {
  userId: string;
  name: string;
  targetAmount: Money;
  currentAmount?: Money;
  deadline?: Date;
  priority: GoalPriority;
  icon?: string;
  color?: string;
}

export class SavingsGoal {
  private _currentAmount: Money;
  private _status: GoalStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly targetAmount: Money,
    currentAmount: Money,
    public readonly deadline: Date | undefined,
    public readonly priority: GoalPriority,
    public readonly icon: string,
    public readonly color: string,
    status: GoalStatus = GoalStatus.ACTIVE
  ) {
    this._currentAmount = currentAmount;
    this._status = status;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.validate();
  }

  static create(data: CreateSavingsGoalData): SavingsGoal {
    return new SavingsGoal(
      uuidv4(),
      data.userId,
      data.name,
      data.targetAmount,
      data.currentAmount || Money.zero(data.targetAmount.currency),
      data.deadline,
      data.priority,
      data.icon || '🎯',
      data.color || '#6CC04A',
      GoalStatus.ACTIVE
    );
  }

  static reconstitute(
    id: string,
    userId: string,
    name: string,
    targetAmount: Money,
    currentAmount: Money,
    deadline: Date | undefined,
    priority: GoalPriority,
    icon: string,
    color: string,
    status: GoalStatus,
    createdAt: Date,
    updatedAt: Date
  ): SavingsGoal {
    const goal = new SavingsGoal(
      id,
      userId,
      name,
      targetAmount,
      currentAmount,
      deadline,
      priority,
      icon,
      color,
      status
    );
    (goal as any).createdAt = createdAt;
    goal.updatedAt = updatedAt;
    return goal;
  }

  addContribution(amount: Money): void {
    if (this._status !== GoalStatus.ACTIVE) {
      throw new BusinessRuleException('Cannot add contribution to inactive goal');
    }
    if (amount.isNegative() || amount.isZero()) {
      throw new ValidationException('Contribution must be positive');
    }

    this._currentAmount = this._currentAmount.add(amount);
    this.updatedAt = new Date();

    if (this.isCompleted()) {
      this._status = GoalStatus.COMPLETED;
    }
  }

  removeContribution(amount: Money): void {
    if (amount.isNegative() || amount.isZero()) {
      throw new ValidationException('Amount must be positive');
    }
    if (this._currentAmount.isLessThan(amount)) {
      throw new BusinessRuleException('Cannot remove more than current amount');
    }

    this._currentAmount = this._currentAmount.subtract(amount);
    this.updatedAt = new Date();

    if (this._status === GoalStatus.COMPLETED && !this.isCompleted()) {
      this._status = GoalStatus.ACTIVE;
    }
  }

  pause(): void {
    if (this._status === GoalStatus.COMPLETED) {
      throw new BusinessRuleException('Cannot pause completed goal');
    }
    this._status = GoalStatus.PAUSED;
    this.updatedAt = new Date();
  }

  resume(): void {
    if (this._status !== GoalStatus.PAUSED) {
      throw new BusinessRuleException('Can only resume paused goals');
    }
    this._status = GoalStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  cancel(): void {
    if (this._status === GoalStatus.COMPLETED) {
      throw new BusinessRuleException('Cannot cancel completed goal');
    }
    this._status = GoalStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  getProgress(): Percentage {
    if (this.targetAmount.isZero()) {
      return Percentage.fromValue(0);
    }
    const progress = (this._currentAmount.amount / this.targetAmount.amount) * 100;
    return Percentage.fromValue(Math.min(progress, 100));
  }

  getRemaining(): Money {
    return this.targetAmount.subtract(this._currentAmount);
  }

  isCompleted(): boolean {
    return this._currentAmount.isGreaterThan(this.targetAmount) ||
           this._currentAmount.equals(this.targetAmount);
  }

  isOverdue(): boolean {
    if (!this.deadline || this._status === GoalStatus.COMPLETED) {
      return false;
    }
    return new Date() > this.deadline;
  }

  getDaysRemaining(): number | null {
    if (!this.deadline) return null;
    const now = new Date();
    const diff = this.deadline.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getMonthlyContributionNeeded(): Money | null {
    if (!this.deadline || this.isCompleted()) return null;

    const daysRemaining = this.getDaysRemaining();
    if (daysRemaining === null || daysRemaining <= 0) return null;

    const monthsRemaining = Math.max(1, daysRemaining / 30);
    const remaining = this.getRemaining();
    return remaining.divide(monthsRemaining);
  }

  get currentAmount(): Money {
    return this._currentAmount;
  }

  get status(): GoalStatus {
    return this._status;
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new ValidationException('Goal name cannot be empty');
    }
    if (this.name.length > 100) {
      throw new ValidationException('Goal name cannot exceed 100 characters');
    }
    if (this.targetAmount.isNegative() || this.targetAmount.isZero()) {
      throw new ValidationException('Target amount must be positive');
    }
    if (this._currentAmount.isNegative()) {
      throw new ValidationException('Current amount cannot be negative');
    }
    if (this.deadline && this.deadline < this.createdAt) {
      throw new ValidationException('Deadline cannot be in the past');
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      name: this.name,
      targetAmount: this.targetAmount.toJSON(),
      currentAmount: this._currentAmount.toJSON(),
      remaining: this.getRemaining().toJSON(),
      progress: this.getProgress().value,
      deadline: this.deadline?.toISOString(),
      priority: this.priority,
      icon: this.icon,
      color: this.color,
      status: this._status,
      isCompleted: this.isCompleted(),
      isOverdue: this.isOverdue(),
      daysRemaining: this.getDaysRemaining(),
      monthlyContributionNeeded: this.getMonthlyContributionNeeded()?.toJSON(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
