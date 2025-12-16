import { v4 as uuidv4 } from 'uuid';

export enum InsightType {
  SAVING_OPPORTUNITY = 'SAVING_OPPORTUNITY',
  SPENDING_ALERT = 'SPENDING_ALERT',
  GOAL_PROGRESS = 'GOAL_PROGRESS',
  DEBT_WARNING = 'DEBT_WARNING',
  INVESTMENT_TIP = 'INVESTMENT_TIP',
  GENERAL_ADVICE = 'GENERAL_ADVICE',
}

export enum InsightPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface CreateInsightData {
  userId: string;
  type: InsightType;
  priority: InsightPriority;
  title: string;
  description: string;
  actionableSteps?: string[];
  potentialImpact?: string;
}

export class FinancialInsight {
  private readonly createdAt: Date;
  private _dismissed: boolean = false;

  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: InsightType,
    public readonly priority: InsightPriority,
    public readonly title: string,
    public readonly description: string,
    public readonly actionableSteps: string[],
    public readonly potentialImpact: string | undefined
  ) {
    this.createdAt = new Date();
  }

  static create(data: CreateInsightData): FinancialInsight {
    return new FinancialInsight(
      uuidv4(),
      data.userId,
      data.type,
      data.priority,
      data.title,
      data.description,
      data.actionableSteps || [],
      data.potentialImpact
    );
  }

  dismiss(): void {
    this._dismissed = true;
  }

  get dismissed(): boolean {
    return this._dismissed;
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      priority: this.priority,
      title: this.title,
      description: this.description,
      actionableSteps: this.actionableSteps,
      potentialImpact: this.potentialImpact,
      dismissed: this._dismissed,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

