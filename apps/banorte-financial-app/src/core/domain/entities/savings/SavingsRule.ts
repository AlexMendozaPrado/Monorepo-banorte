import { v4 as uuidv4 } from 'uuid';
import { Money } from '../../value-objects/financial/Money';
import { Percentage } from '../../value-objects/financial/Percentage';
import { ValidationException, BusinessRuleException } from '../../exceptions';

export enum RuleType {
  ROUNDUP = 'ROUNDUP',           // Redondear compras
  PERCENTAGE = 'PERCENTAGE',     // Porcentaje del ingreso
  FIXED_AMOUNT = 'FIXED_AMOUNT', // Cantidad fija
  CONDITIONAL = 'CONDITIONAL',   // Basado en condiciones
}

export enum RuleFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
  PER_TRANSACTION = 'PER_TRANSACTION',
}

export interface CreateSavingsRuleData {
  userId: string;
  goalId: string;
  name: string;
  type: RuleType;
  frequency: RuleFrequency;
  amount?: Money;
  percentage?: Percentage;
  active?: boolean;
}

export class SavingsRule {
  private _active: boolean;
  private _executionCount: number = 0;
  private _totalSaved: Money;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private lastExecutedAt?: Date;

  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly goalId: string,
    public readonly name: string,
    public readonly type: RuleType,
    public readonly frequency: RuleFrequency,
    public readonly amount: Money | undefined,
    public readonly percentage: Percentage | undefined,
    active: boolean,
    totalSaved: Money
  ) {
    this._active = active;
    this._totalSaved = totalSaved;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.validate();
  }

  static create(data: CreateSavingsRuleData): SavingsRule {
    const currency = data.amount?.currency || 'MXN';
    return new SavingsRule(
      uuidv4(),
      data.userId,
      data.goalId,
      data.name,
      data.type,
      data.frequency,
      data.amount,
      data.percentage,
      data.active !== false,
      Money.zero(currency as any)
    );
  }

  static reconstitute(
    id: string,
    userId: string,
    goalId: string,
    name: string,
    type: RuleType,
    frequency: RuleFrequency,
    amount: Money | undefined,
    percentage: Percentage | undefined,
    active: boolean,
    executionCount: number,
    totalSaved: Money,
    createdAt: Date,
    updatedAt: Date,
    lastExecutedAt?: Date
  ): SavingsRule {
    const rule = new SavingsRule(
      id,
      userId,
      goalId,
      name,
      type,
      frequency,
      amount,
      percentage,
      active,
      totalSaved
    );
    rule._executionCount = executionCount;
    (rule as any).createdAt = createdAt;
    rule.updatedAt = updatedAt;
    rule.lastExecutedAt = lastExecutedAt;
    return rule;
  }

  activate(): void {
    this._active = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this._active = false;
    this.updatedAt = new Date();
  }

  execute(baseAmount?: Money): Money {
    if (!this._active) {
      throw new BusinessRuleException('Cannot execute inactive rule');
    }

    let savedAmount: Money;

    switch (this.type) {
      case RuleType.FIXED_AMOUNT:
        if (!this.amount) {
          throw new BusinessRuleException('Fixed amount rule requires amount');
        }
        savedAmount = this.amount;
        break;

      case RuleType.PERCENTAGE:
        if (!this.percentage || !baseAmount) {
          throw new BusinessRuleException('Percentage rule requires percentage and base amount');
        }
        savedAmount = baseAmount.multiply(this.percentage.toDecimal());
        break;

      case RuleType.ROUNDUP:
        if (!baseAmount) {
          throw new BusinessRuleException('Roundup rule requires base amount');
        }
        const roundedUp = Math.ceil(baseAmount.amount);
        const roundupAmount = roundedUp - baseAmount.amount;
        savedAmount = Money.fromAmount(roundupAmount, baseAmount.currency);
        break;

      case RuleType.CONDITIONAL:
        if (!baseAmount) {
          throw new BusinessRuleException('Conditional rule requires base amount');
        }
        savedAmount = this.amount || Money.zero(baseAmount.currency);
        break;

      default:
        throw new BusinessRuleException('Unknown rule type');
    }

    this._executionCount++;
    this._totalSaved = this._totalSaved.add(savedAmount);
    this.lastExecutedAt = new Date();
    this.updatedAt = new Date();

    return savedAmount;
  }

  canExecute(): boolean {
    return this._active;
  }

  shouldExecuteToday(): boolean {
    if (!this._active) return false;
    if (!this.lastExecutedAt) return true;

    const now = new Date();
    const daysSinceLastExecution = Math.floor(
      (now.getTime() - this.lastExecutedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    switch (this.frequency) {
      case RuleFrequency.DAILY:
        return daysSinceLastExecution >= 1;
      case RuleFrequency.WEEKLY:
        return daysSinceLastExecution >= 7;
      case RuleFrequency.BIWEEKLY:
        return daysSinceLastExecution >= 14;
      case RuleFrequency.MONTHLY:
        return daysSinceLastExecution >= 30;
      case RuleFrequency.PER_TRANSACTION:
        return true;
      default:
        return false;
    }
  }

  get active(): boolean {
    return this._active;
  }

  get executionCount(): number {
    return this._executionCount;
  }

  get totalSaved(): Money {
    return this._totalSaved;
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new ValidationException('Rule name cannot be empty');
    }
    if (this.type === RuleType.FIXED_AMOUNT && !this.amount) {
      throw new ValidationException('Fixed amount rule requires amount');
    }
    if (this.type === RuleType.PERCENTAGE && !this.percentage) {
      throw new ValidationException('Percentage rule requires percentage');
    }
    if (this.amount && this.amount.isNegative()) {
      throw new ValidationException('Rule amount cannot be negative');
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      goalId: this.goalId,
      name: this.name,
      type: this.type,
      frequency: this.frequency,
      amount: this.amount?.toJSON(),
      percentage: this.percentage?.value,
      active: this._active,
      executionCount: this._executionCount,
      totalSaved: this._totalSaved.toJSON(),
      lastExecutedAt: this.lastExecutedAt?.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
