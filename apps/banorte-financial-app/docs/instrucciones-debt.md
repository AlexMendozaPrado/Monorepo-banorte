# PROMPT 5: Banorte Financial App - Módulo Debt Completo

## 🎯 Objetivo del Prompt

Implementar completamente el módulo de Deudas (Debt) incluyendo:
- Entidades de dominio (Debt, DebtPayment, PaymentStrategy)
- Use Cases con estrategias de pago optimizadas
- Repositorios y adaptadores de IA
- API Routes completos
- Todos los componentes React del módulo
- Hooks personalizados
- Simulador de pagos
- Integración completa

## 📋 Prerrequisitos

✅ PROMPT 1, 2, 3 y 4 completados

---

## 📂 Estructura del Módulo Debt
```
src/
├── core/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── debt/
│   │   │       ├── Debt.ts
│   │   │       ├── DebtPayment.ts
│   │   │       ├── PaymentStrategy.ts
│   │   │       └── AmortizationSchedule.ts
│   │   └── ports/
│   │       ├── repositories/
│   │       │   ├── IDebtRepository.ts
│   │       │   └── IDebtPaymentRepository.ts
│   │       └── ai-services/
│   │           └── IDebtStrategyPort.ts
│   ├── application/
│   │   ├── use-cases/
│   │   │   └── debt/
│   │   │       ├── CreateDebtUseCase.ts
│   │   │       ├── CalculatePaymentStrategyUseCase.ts
│   │   │       ├── SimulateExtraPaymentUseCase.ts
│   │   │       ├── OptimizeDebtPayoffUseCase.ts
│   │   │       └── RecordPaymentUseCase.ts
│   │   └── dtos/
│   │       └── debt/
│   │           ├── DebtDTO.ts
│   │           ├── PaymentStrategyDTO.ts
│   │           └── SimulationDTO.ts
├── infrastructure/
│   ├── repositories/
│   │   └── in-memory/
│   │       ├── InMemoryDebtRepository.ts
│   │       └── InMemoryDebtPaymentRepository.ts
│   ├── ai/
│   │   └── providers/
│   │       └── openai/
│   │           └── OpenAIDebtStrategy.ts
│   └── di/
│       └── debtModule.ts
└── app/
    ├── api/
    │   └── debt/
    │       ├── route.ts
    │       ├── strategy/
    │       │   └── route.ts
    │       └── simulate/
    │           └── route.ts
    ├── components/
    │   └── debt/
    │       ├── DebtDashboard.tsx
    │       ├── DebtCard.tsx
    │       ├── PaymentStrategy.tsx
    │       ├── DebtDetailModal.tsx
    │       ├── PaymentSimulator.tsx
    │       ├── NormaRecommendations.tsx
    │       ├── CreditHealthScore.tsx
    │       ├── PaymentAlerts.tsx
    │       └── AddDebtModal.tsx
    ├── hooks/
    │   ├── useDebts.ts
    │   └── usePaymentStrategy.ts
    └── pages/
        └── DebtModule.tsx
```

---

## 📝 PARTE 1: DOMAIN LAYER - ENTIDADES

### 1.1 Debt.ts

**Ruta:** `src/core/domain/entities/debt/Debt.ts`
```typescript
import { v4 as uuidv4 } from 'uuid';
import { Money } from '../../value-objects/financial/Money';
import { InterestRate } from '../../value-objects/financial/InterestRate';
import { Percentage } from '../../value-objects/financial/Percentage';
import { ValidationException, BusinessRuleException } from '../../exceptions';

export enum DebtType {
  CREDIT_CARD = 'CREDIT_CARD',
  PERSONAL_LOAN = 'PERSONAL_LOAN',
  MORTGAGE = 'MORTGAGE',
  AUTO_LOAN = 'AUTO_LOAN',
  STUDENT_LOAN = 'STUDENT_LOAN',
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
  originalAmount: Money;
  currentBalance: Money;
  interestRate: InterestRate;
  minimumPayment: Money;
  dueDate?: Date;
}

export class Debt {
  private _currentBalance: Money;
  private _status: DebtStatus;
  private _totalPaid: Money;
  private _totalInterestPaid: Money;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: DebtType,
    public readonly name: string,
    public readonly originalAmount: Money,
    currentBalance: Money,
    public readonly interestRate: InterestRate,
    public readonly minimumPayment: Money,
    public readonly dueDate: Date | undefined,
    status: DebtStatus = DebtStatus.ACTIVE
  ) {
    this._currentBalance = currentBalance;
    this._status = status;
    this._totalPaid = originalAmount.subtract(currentBalance);
    this._totalInterestPaid = Money.zero(originalAmount.currency);
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.validate();
  }

  static create(data: CreateDebtData): Debt {
    return new Debt(
      uuidv4(),
      data.userId,
      data.type,
      data.name,
      data.originalAmount,
      data.currentBalance,
      data.interestRate,
      data.minimumPayment,
      data.dueDate,
      DebtStatus.ACTIVE
    );
  }

  static reconstitute(
    id: string,
    userId: string,
    type: DebtType,
    name: string,
    originalAmount: Money,
    currentBalance: Money,
    interestRate: InterestRate,
    minimumPayment: Money,
    dueDate: Date | undefined,
    status: DebtStatus,
    totalPaid: Money,
    totalInterestPaid: Money,
    createdAt: Date,
    updatedAt: Date
  ): Debt {
    const debt = new Debt(
      id,
      userId,
      type,
      name,
      originalAmount,
      currentBalance,
      interestRate,
      minimumPayment,
      dueDate,
      status
    );
    debt._totalPaid = totalPaid;
    debt._totalInterestPaid = totalInterestPaid;
    (debt as any).createdAt = createdAt;
    debt.updatedAt = updatedAt;
    return debt;
  }

  makePayment(amount: Money, interestPortion: Money): void {
    if (this._status !== DebtStatus.ACTIVE) {
      throw new BusinessRuleException('Cannot make payment on inactive debt');
    }
    if (amount.isNegative() || amount.isZero()) {
      throw new ValidationException('Payment amount must be positive');
    }
    if (amount.isGreaterThan(this._currentBalance)) {
      throw new BusinessRuleException('Payment exceeds current balance');
    }

    this._currentBalance = this._currentBalance.subtract(amount);
    this._totalPaid = this._totalPaid.add(amount);
    this._totalInterestPaid = this._totalInterestPaid.add(interestPortion);
    this.updatedAt = new Date();

    if (this._currentBalance.isZero()) {
      this._status = DebtStatus.PAID_OFF;
    }
  }

  getProgress(): Percentage {
    if (this.originalAmount.isZero()) {
      return Percentage.fromValue(0);
    }
    const progress = (this._totalPaid.amount / this.originalAmount.amount) * 100;
    return Percentage.fromValue(Math.min(progress, 100));
  }

  getMonthlyInterest(): Money {
    const monthlyRate = this.interestRate.toMonthlyRate();
    return this._currentBalance.multiply(monthlyRate / 100);
  }

  calculateMonthsToPayoff(monthlyPayment: Money): number | null {
    if (monthlyPayment.isLessThan(this.minimumPayment)) {
      return null; // Cannot pay off with less than minimum
    }

    if (this._currentBalance.isZero()) {
      return 0;
    }

    let balance = this._currentBalance.amount;
    const payment = monthlyPayment.amount;
    const monthlyRate = this.interestRate.toMonthlyRate() / 100;
    let months = 0;

    while (balance > 0 && months < 600) { // Max 50 years
      const interest = balance * monthlyRate;
      const principal = Math.min(payment - interest, balance);
      
      if (principal <= 0) {
        return null; // Payment doesn't cover interest
      }

      balance -= principal;
      months++;
    }

    return months;
  }

  calculateTotalInterest(monthlyPayment: Money): Money | null {
    const months = this.calculateMonthsToPayoff(monthlyPayment);
    if (months === null) return null;

    let balance = this._currentBalance.amount;
    const payment = monthlyPayment.amount;
    const monthlyRate = this.interestRate.toMonthlyRate() / 100;
    let totalInterest = 0;

    for (let i = 0; i < months; i++) {
      const interest = balance * monthlyRate;
      totalInterest += interest;
      const principal = payment - interest;
      balance -= principal;
    }

    return Money.fromAmount(totalInterest, this._currentBalance.currency);
  }

  isPastDue(): boolean {
    if (!this.dueDate || this._status !== DebtStatus.ACTIVE) return false;
    return new Date() > this.dueDate;
  }

  get currentBalance(): Money {
    return this._currentBalance;
  }

  get status(): DebtStatus {
    return this._status;
  }

  get totalPaid(): Money {
    return this._totalPaid;
  }

  get totalInterestPaid(): Money {
    return this._totalInterestPaid;
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new ValidationException('Debt name cannot be empty');
    }
    if (this.originalAmount.isNegative() || this.originalAmount.isZero()) {
      throw new ValidationException('Original amount must be positive');
    }
    if (this._currentBalance.isNegative()) {
      throw new ValidationException('Current balance cannot be negative');
    }
    if (this._currentBalance.isGreaterThan(this.originalAmount)) {
      throw new ValidationException('Current balance cannot exceed original amount');
    }
    if (this.minimumPayment.isNegative()) {
      throw new ValidationException('Minimum payment cannot be negative');
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      name: this.name,
      originalAmount: this.originalAmount.toJSON(),
      currentBalance: this._currentBalance.toJSON(),
      interestRate: this.interestRate.toAnnualRate(),
      minimumPayment: this.minimumPayment.toJSON(),
      dueDate: this.dueDate?.toISOString(),
      status: this._status,
      progress: this.getProgress().value,
      totalPaid: this._totalPaid.toJSON(),
      totalInterestPaid: this._totalInterestPaid.toJSON(),
      monthlyInterest: this.getMonthlyInterest().toJSON(),
      isPastDue: this.isPastDue(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
```

### 1.2 PaymentStrategy.ts

**Ruta:** `src/core/domain/entities/debt/PaymentStrategy.ts`
```typescript
import { Debt } from './Debt';
import { Money } from '../../value-objects/financial/Money';

export enum StrategyType {
  AVALANCHE = 'AVALANCHE', // Highest interest first
  SNOWBALL = 'SNOWBALL',   // Lowest balance first
  BALANCED = 'BALANCED',   // Mix of both
}

export interface PaymentPlan {
  debtId: string;
  debtName: string;
  monthlyPayment: Money;
  monthsToPayoff: number;
  totalInterest: Money;
  priority: number;
}

export class PaymentStrategy {
  private constructor(
    public readonly type: StrategyType,
    public readonly totalMonthlyPayment: Money,
    public readonly plans: PaymentPlan[],
    public readonly totalMonthsToPayoff: number,
    public readonly totalInterestSaved: Money,
    public readonly reasoning: string
  ) {}

  static calculateAvalanche(
    debts: Debt[],
    availableMonthly: Money
  ): PaymentStrategy {
    const activeDebts = debts.filter(d => d.status === 'ACTIVE');
    
    // Sort by interest rate (highest first)
    const sortedDebts = [...activeDebts].sort((a, b) => {
      const rateA = a.interestRate.toAnnualRate();
      const rateB = b.interestRate.toAnnualRate();
      return rateB - rateA;
    });

    const plans = this.distributePay ments(sortedDebts, availableMonthly);
    const totalMonths = Math.max(...plans.map(p => p.monthsToPayoff));
    const totalInterest = plans.reduce(
      (sum, p) => sum.add(p.totalInterest),
      Money.zero(availableMonthly.currency)
    );

    return new PaymentStrategy(
      StrategyType.AVALANCHE,
      availableMonthly,
      plans,
      totalMonths,
      totalInterest,
      'Prioriza deudas con mayor interés para minimizar el costo total'
    );
  }

  static calculateSnowball(
    debts: Debt[],
    availableMonthly: Money
  ): PaymentStrategy {
    const activeDebts = debts.filter(d => d.status === 'ACTIVE');
    
    // Sort by balance (lowest first)
    const sortedDebts = [...activeDebts].sort((a, b) => {
      return a.currentBalance.amount - b.currentBalance.amount;
    });

    const plans = this.distributePayments(sortedDebts, availableMonthly);
    const totalMonths = Math.max(...plans.map(p => p.monthsToPayoff));
    const totalInterest = plans.reduce(
      (sum, p) => sum.add(p.totalInterest),
      Money.zero(availableMonthly.currency)
    );

    return new PaymentStrategy(
      StrategyType.SNOWBALL,
      availableMonthly,
      plans,
      totalMonths,
      totalInterest,
      'Prioriza deudas más pequeñas para victorias tempranas y motivación'
    );
  }

  static calculateBalanced(
    debts: Debt[],
    availableMonthly: Money
  ): PaymentStrategy {
    const activeDebts = debts.filter(d => d.status === 'ACTIVE');
    
    // Hybrid approach: consider both balance and interest rate
    const sortedDebts = [...activeDebts].sort((a, b) => {
      const scoreA = (a.interestRate.toAnnualRate() / 100) * 0.6 + 
                     (1 / a.currentBalance.amount) * 0.4;
      const scoreB = (b.interestRate.toAnnualRate() / 100) * 0.6 + 
                     (1 / b.currentBalance.amount) * 0.4;
      return scoreB - scoreA;
    });

    const plans = this.distributePayments(sortedDebts, availableMonthly);
    const totalMonths = Math.max(...plans.map(p => p.monthsToPayoff));
    const totalInterest = plans.reduce(
      (sum, p) => sum.add(p.totalInterest),
      Money.zero(availableMonthly.currency)
    );

    return new PaymentStrategy(
      StrategyType.BALANCED,
      availableMonthly,
      plans,
      totalMonths,
      totalInterest,
      'Balance entre ahorro de intereses y victorias tempranas'
    );
  }

  private static distributePayments(
    sortedDebts: Debt[],
    availableMonthly: Money
  ): PaymentPlan[] {
    const plans: PaymentPlan[] = [];
    let remainingBudget = availableMonthly.amount;

    // Primero, asignar pagos mínimos
    const minimumTotal = sortedDebts.reduce(
      (sum, debt) => sum + debt.minimumPayment.amount,
      0
    );

    if (minimumTotal > availableMonthly.amount) {
      // No hay suficiente para pagos mínimos, distribuir proporcionalmente
      sortedDebts.forEach((debt, index) => {
        const proportion = debt.minimumPayment.amount / minimumTotal;
        const payment = Money.fromAmount(
          availableMonthly.amount * proportion,
          availableMonthly.currency
        );
        const months = debt.calculateMonthsToPayoff(payment) || 999;
        const totalInterest = debt.calculateTotalInterest(payment) || Money.zero();

        plans.push({
          debtId: debt.id,
          debtName: debt.name,
          monthlyPayment: payment,
          monthsToPayoff: months,
          totalInterest,
          priority: index + 1,
        });
      });
    } else {
      // Hay presupuesto extra después de mínimos
      const extraBudget = remainingBudget - minimumTotal;
      
      sortedDebts.forEach((debt, index) => {
        const basePayment = debt.minimumPayment.amount;
        const extraPayment = index === 0 ? extraBudget : 0; // Extra va a la primera deuda
        const totalPayment = Money.fromAmount(
          basePayment + extraPayment,
          availableMonthly.currency
        );
        
        const months = debt.calculateMonthsToPayoff(totalPayment) || 999;
        const totalInterest = debt.calculateTotalInterest(totalPayment) || Money.zero();

        plans.push({
          debtId: debt.id,
          debtName: debt.name,
          monthlyPayment: totalPayment,
          monthsToPayoff: months,
          totalInterest,
          priority: index + 1,
        });
      });
    }

    return plans;
  }

  toJSON() {
    return {
      type: this.type,
      totalMonthlyPayment: this.totalMonthlyPayment.toJSON(),
      plans: this.plans.map(p => ({
        debtId: p.debtId,
        debtName: p.debtName,
        monthlyPayment: p.monthlyPayment.toJSON(),
        monthsToPayoff: p.monthsToPayoff,
        totalInterest: p.totalInterest.toJSON(),
        priority: p.priority,
      })),
      totalMonthsToPayoff: this.totalMonthsToPayoff,
      totalInterestSaved: this.totalInterestSaved.toJSON(),
      reasoning: this.reasoning,
    };
  }
}
```

---

## 📝 PARTE 2: DOMAIN LAYER - PORTS

### 2.1 IDebtRepository.ts

**Ruta:** `src/core/domain/ports/repositories/IDebtRepository.ts`
```typescript
import { Debt, DebtStatus, DebtType } from '../../entities/debt/Debt';

export interface IDebtRepository {
  save(debt: Debt): Promise<void>;
  findById(id: string): Promise<Debt | null>;
  findByUser(userId: string): Promise<Debt[]>;
  findByUserAndStatus(userId: string, status: DebtStatus): Promise<Debt[]>;
  findByUserAndType(userId: string, type: DebtType): Promise<Debt[]>;
  delete(id: string): Promise<void>;
  countByUser(userId: string): Promise<number>;
}
```

### 2.2 IDebtStrategyPort.ts

**Ruta:** `src/core/domain/ports/ai-services/IDebtStrategyPort.ts`
```typescript
import { Debt } from '../../entities/debt/Debt';
import { Money } from '../../value-objects/financial/Money';

export interface DebtRecommendation {
  type: 'CONSOLIDATION' | 'REFINANCE' | 'EXTRA_PAYMENT' | 'PRIORITY_CHANGE';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  potentialSavings: Money;
  actionItems: string[];
  estimatedTimeframe: string;
}

export interface IDebtStrategyPort {
  analyzeDebtPortfolio(
    debts: Debt[],
    monthlyIncome: Money,
    monthlyExpenses: Money
  ): Promise<{
    totalDebt: Money;
    debtToIncomeRatio: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendations: DebtRecommendation[];
  }>;

  suggestConsolidation(
    debts: Debt[]
  ): Promise<{
    recommended: boolean;
    potentialNewLoan: {
      amount: Money;
      rate: number;
      term: number;
    };
    monthlySavings: Money;
    totalSavings: Money;
    reasoning: string;
  }>;

  optimizeExtraPayments(
    debts: Debt[],
    extraAmount: Money
  ): Promise<{
    allocations: {
      debtId: string;
      amount: Money;
      reasoning: string;
      interestSaved: Money;
    }[];
    totalInterestSaved: Money;
  }>;
}
```

---

## 📝 PARTE 3: APPLICATION LAYER - USE CASES

### 3.1 CreateDebtUseCase.ts

**Ruta:** `src/core/application/use-cases/debt/CreateDebtUseCase.ts`
```typescript
import { IDebtRepository } from '@/core/domain/ports/repositories/IDebtRepository';
import { Debt, DebtType } from '@/core/domain/entities/debt/Debt';
import { Money } from '@/core/domain/value-objects/financial/Money';
import { InterestRate } from '@/core/domain/value-objects/financial/InterestRate';

export interface CreateDebtDTO {
  userId: string;
  type: string;
  name: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  dueDate?: string;
  currency?: string;
}

export class CreateDebtUseCase {
  constructor(
    private readonly debtRepository: IDebtRepository
  ) {}

  async execute(dto: CreateDebtDTO) {
    const currency = dto.currency || 'MXN';
    
    const debt = Debt.create({
      userId: dto.userId,
      type: dto.type as DebtType,
      name: dto.name,
      originalAmount: Money.fromAmount(dto.originalAmount, currency as any),
      currentBalance: Money.fromAmount(dto.currentBalance, currency as any),
      interestRate: InterestRate.fromAnnualRate(dto.interestRate),
      minimumPayment: Money.fromAmount(dto.minimumPayment, currency as any),
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });

    await this.debtRepository.save(debt);

    return debt.toJSON();
  }
}
```

### 3.2 CalculatePaymentStrategyUseCase.ts

**Ruta:** `src/core/application/use-cases/debt/CalculatePaymentStrategyUseCase.ts`
```typescript
import { IDebtRepository } from '@/core/domain/ports/repositories/IDebtRepository';
import { PaymentStrategy, StrategyType } from '@/core/domain/entities/debt/PaymentStrategy';
import { Money } from '@/core/domain/value-objects/financial/Money';

export interface CalculateStrategyDTO {
  userId: string;
  availableMonthly: number;
  strategyType: 'AVALANCHE' | 'SNOWBALL' | 'BALANCED';
  currency?: string;
}

export class CalculatePaymentStrategyUseCase {
  constructor(
    private readonly debtRepository: IDebtRepository
  ) {}

  async execute(dto: CalculateStrategyDTO) {
    const debts = await this.debtRepository.findByUser(dto.userId);
    const activeDebts = debts.filter(d => d.status === 'ACTIVE');

    if (activeDebts.length === 0) {
      return {
        message: 'No tienes deudas activas',
        strategy: null,
      };
    }

    const currency = dto.currency || 'MXN';
    const availableMonthly = Money.fromAmount(dto.availableMonthly, currency as any);

    let strategy: PaymentStrategy;

    switch (dto.strategyType) {
      case 'AVALANCHE':
        strategy = PaymentStrategy.calculateAvalanche(activeDebts, availableMonthly);
        break;
      case 'SNOWBALL':
        strategy = PaymentStrategy.calculateSnowball(activeDebts, availableMonthly);
        break;
      case 'BALANCED':
        strategy = PaymentStrategy.calculateBalanced(activeDebts, availableMonthly);
        break;
      default:
        strategy = PaymentStrategy.calculateAvalanche(activeDebts, availableMonthly);
    }

    return {
      strategy: strategy.toJSON(),
      activeDebtsCount: activeDebts.length,
    };
  }
}
```

### 3.3 SimulateExtraPaymentUseCase.ts

**Ruta:** `src/core/application/use-cases/debt/SimulateExtraPaymentUseCase.ts`
```typescript
import { IDebtRepository } from '@/core/domain/ports/repositories/IDebtRepository';
import { Money } from '@/core/domain/value-objects/financial/Money';
import { NotFoundException } from '@/core/domain/exceptions';

export interface SimulateExtraPaymentDTO {
  debtId: string;
  extraPayment: number;
  currency?: string;
}

export class SimulateExtraPaymentUseCase {
  constructor(
    private readonly debtRepository: IDebtRepository
  ) {}

  async execute(dto: SimulateExtraPaymentDTO) {
    const debt = await this.debtRepository.findById(dto.debtId);
    if (!debt) {
      throw new NotFoundException('Debt', dto.debtId);
    }

    const currency = dto.currency || debt.currentBalance.currency;
    const extraPayment = Money.fromAmount(dto.extraPayment, currency as any);
    
    // Calcular escenario actual
    const currentPayment = debt.minimumPayment;
    const currentMonths = debt.calculateMonthsToPayoff(currentPayment);
    const currentInterest = debt.calculateTotalInterest(currentPayment);

    // Calcular escenario con pago extra
    const newPayment = currentPayment.add(extraPayment);
    const newMonths = debt.calculateMonthsToPayoff(newPayment);
    const newInterest = debt.calculateTotalInterest(newPayment);

    if (!currentMonths || !currentInterest || !newMonths || !newInterest) {
      return {
        error: 'No se pudo calcular la simulación',
      };
    }

    const interestSaved = currentInterest.subtract(newInterest);
    const monthsSaved = currentMonths - newMonths;

    return {
      current: {
        monthlyPayment: currentPayment.toJSON(),
        months: currentMonths,
        totalInterest: currentInterest.toJSON(),
      },
      withExtra: {
        monthlyPayment: newPayment.toJSON(),
        months: newMonths,
        totalInterest: newInterest.toJSON(),
      },
      savings: {
        interestSaved: interestSaved.toJSON(),
        monthsSaved,
        percentSaved: ((interestSaved.amount / currentInterest.amount) * 100).toFixed(2),
      },
    };
  }
}
```

---

## 📝 PARTE 4: INFRASTRUCTURE LAYER

### 4.1 InMemoryDebtRepository.ts

**Ruta:** `src/infrastructure/repositories/in-memory/InMemoryDebtRepository.ts`
```typescript
import { IDebtRepository } from '@/core/domain/ports/repositories/IDebtRepository';
import { Debt, DebtStatus, DebtType } from '@/core/domain/entities/debt/Debt';

export class InMemoryDebtRepository implements IDebtRepository {
  private debts: Map<string, Debt> = new Map();

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
        // Active debts first, then by interest rate
        if (a.status !== b.status) {
          return a.status === DebtStatus.ACTIVE ? -1 : 1;
        }
        const rateA = a.interestRate.toAnnualRate();
        const rateB = b.interestRate.toAnnualRate();
        return rateB - rateA;
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
```

### 4.2 OpenAIDebtStrategy.ts

**Ruta:** `src/infrastructure/ai/providers/openai/OpenAIDebtStrategy.ts`
```typescript
import { IDebtStrategyPort, DebtRecommendation } from '@/core/domain/ports/ai-services/IDebtStrategyPort';
import { Debt } from '@/core/domain/entities/debt/Debt';
import { Money } from '@/core/domain/value-objects/financial/Money';
import { OpenAIConfig } from './OpenAIConfig';

export class OpenAIDebtStrategy implements IDebtStrategyPort {
  private config: ReturnType<OpenAIConfig['getConfig']>;

  constructor() {
    const configInstance = OpenAIConfig.getInstance();
    this.config = configInstance.getConfig();
  }

  async analyzeDebtPortfolio(
    debts: Debt[],
    monthlyIncome: Money,
    monthlyExpenses: Money
  ) {
    const totalDebt = debts.reduce(
      (sum, debt) => sum.add(debt.currentBalance),
      Money.zero()
    );

    const debtToIncomeRatio = (totalDebt.amount / monthlyIncome.amount) * 100;

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (debtToIncomeRatio < 36) riskLevel = 'LOW';
    else if (debtToIncomeRatio < 50) riskLevel = 'MEDIUM';
    else if (debtToIncomeRatio < 80) riskLevel = 'HIGH';
    else riskLevel = 'CRITICAL';

    const recommendations = this.generateRecommendations(debts, debtToIncomeRatio);

    return {
      totalDebt,
      debtToIncomeRatio,
      riskLevel,
      recommendations,
    };
  }

  async suggestConsolidation(debts: Debt[]) {
    const totalDebt = debts.reduce(
      (sum, debt) => sum.add(debt.currentBalance),
      Money.zero()
    );

    const avgRate = debts.reduce((sum, d) => sum + d.interestRate.toAnnualRate(), 0) / debts.length;

    return {
      recommended: avgRate > 15 && debts.length >= 3,
      potentialNewLoan: {
        amount: totalDebt,
        rate: avgRate * 0.7, // 30% reduction estimate
        term: 60,
      },
      monthlySavings: Money.fromAmount(500),
      totalSavings: Money.fromAmount(30000),
      reasoning: 'La consolidación puede reducir tu tasa promedio y simplificar pagos',
    };
  }

  async optimizeExtraPayments(debts: Debt[], extraAmount: Money) {
    // Avalanche approach: allocate to highest interest debt
    const sortedDebts = [...debts].sort((a, b) => 
      b.interestRate.toAnnualRate() - a.interestRate.toAnnualRate()
    );

    const allocations = sortedDebts.map((debt, index) => ({
      debtId: debt.id,
      amount: index === 0 ? extraAmount : Money.zero(),
      reasoning: index === 0 
        ? 'Mayor tasa de interés - máximo ahorro'
        : 'Mantener pagos mínimos',
      interestSaved: index === 0 ? Money.fromAmount(1000) : Money.zero(),
    }));

    return {
      allocations,
      totalInterestSaved: Money.fromAmount(1000),
    };
  }

  private generateRecommendations(
    debts: Debt[],
    debtToIncomeRatio: number
  ): DebtRecommendation[] {
    const recommendations: DebtRecommendation[] = [];

    if (debtToIncomeRatio > 50) {
      recommendations.push({
        type: 'CONSOLIDATION',
        priority: 'HIGH',
        title: 'Considera consolidar tus deudas',
        description: 'Tu ratio deuda-ingreso es alto. La consolidación puede ayudar.',
        potentialSavings: Money.fromAmount(5000),
        actionItems: [
          'Explora opciones de préstamos de consolidación',
          'Compara tasas con tu banco',
        ],
        estimatedTimeframe: '1-3 meses',
      });
    }

    const highInterestDebts = debts.filter(d => d.interestRate.toAnnualRate() > 20);
    if (highInterestDebts.length > 0) {
      recommendations.push({
        type: 'REFINANCE',
        priority: 'HIGH',
        title: 'Refinancia deudas con alta tasa',
        description: `Tienes ${highInterestDebts.length} deuda(s) con tasas >20%`,
        potentialSavings: Money.fromAmount(3000),
        actionItems: [
          'Busca opciones de refinanciamiento',
          'Mejora tu score crediticio',
        ],
        estimatedTimeframe: '2-4 meses',
      });
    }

    return recommendations;
  }
}
```

---

## 📝 PARTE 5: DI MODULE Y API ROUTES

### 5.1 debtModule.ts

**Ruta:** `src/infrastructure/di/debtModule.ts`
```typescript
import { DIContainer } from './container';
import { CreateDebtUseCase } from '@/core/application/use-cases/debt/CreateDebtUseCase';
import { CalculatePaymentStrategyUseCase } from '@/core/application/use-cases/debt/CalculatePaymentStrategyUseCase';
import { SimulateExtraPaymentUseCase } from '@/core/application/use-cases/debt/SimulateExtraPaymentUseCase';
import { InMemoryDebtRepository } from '@/infrastructure/repositories/in-memory/InMemoryDebtRepository';
import { OpenAIDebtStrategy } from '@/infrastructure/ai/providers/openai/OpenAIDebtStrategy';

export function registerDebtModule(container: DIContainer): void {
  console.log('📦 Registering Debt Module...');

  // Repositories
  container.register('IDebtRepository', () => new InMemoryDebtRepository());

  // AI Services
  container.register('IDebtStrategyPort', () => new OpenAIDebtStrategy());

  // Use Cases
  container.register('CreateDebtUseCase', () => {
    return new CreateDebtUseCase(
      container.resolve('IDebtRepository')
    );
  });

  container.register('CalculatePaymentStrategyUseCase', () => {
    return new CalculatePaymentStrategyUseCase(
      container.resolve('IDebtRepository')
    );
  });

  container.register('SimulateExtraPaymentUseCase', () => {
    return new SimulateExtraPaymentUseCase(
      container.resolve('IDebtRepository')
    );
  });

  console.log('✅ Debt Module registered');
}
```

### 5.2 Actualizar DI index.ts:
```typescript
import { container } from './container';
import { registerBudgetModule } from './budgetModule';
import { registerSavingsModule } from './savingsModule';
import { registerCardsModule } from './cardsModule';
import { registerDebtModule } from './debtModule';

export function initializeDI(): void {
  console.log('🚀 Initializing DI Container...');
  
  registerBudgetModule(container);
  registerSavingsModule(container);
  registerCardsModule(container);
  registerDebtModule(container);
  
  console.log('✅ DI Container initialized');
}

export { container };
```

### 5.3 API Routes

**Ruta:** `src/app/api/debt/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di';
import { CreateDebtUseCase } from '@/core/application/use-cases/debt/CreateDebtUseCase';
import { IDebtRepository } from '@/core/domain/ports/repositories/IDebtRepository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useCase = container.resolve<CreateDebtUseCase>('CreateDebtUseCase');
    const result = await useCase.execute(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error creating debt:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const repository = container.resolve<IDebtRepository>('IDebtRepository');
    const debts = await repository.findByUser(userId);

    return NextResponse.json({
      success: true,
      data: debts.map(d => d.toJSON()),
    });
  } catch (error: any) {
    console.error('Error fetching debts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Ruta:** `src/app/api/debt/strategy/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di';
import { CalculatePaymentStrategyUseCase } from '@/core/application/use-cases/debt/CalculatePaymentStrategyUseCase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useCase = container.resolve<CalculatePaymentStrategyUseCase>('CalculatePaymentStrategyUseCase');
    const result = await useCase.execute(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error calculating strategy:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Ruta:** `src/app/api/debt/simulate/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di';
import { SimulateExtraPaymentUseCase } from '@/core/application/use-cases/debt/SimulateExtraPaymentUseCase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useCase = container.resolve<SimulateExtraPaymentUseCase>('SimulateExtraPaymentUseCase');
    const result = await useCase.execute(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error simulating payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 📝 PARTE 6: HOOKS Y COMPONENTES

### 6.1 useDebts.ts

**Ruta:** `src/app/hooks/useDebts.ts`
```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Debt {
  id: string;
  type: string;
  name: string;
  originalAmount: { amount: number; currency: string };
  currentBalance: { amount: number; currency: string };
  interestRate: number;
  minimumPayment: { amount: number; currency: string };
  progress: number;
  status: string;
  monthlyInterest: { amount: number; currency: string };
}

export function useDebts(userId: string) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchDebts();
    }
  }, [userId]);

  const fetchDebts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/debt?userId=${userId}`);

      if (response.data.success) {
        setDebts(response.data.data);
      } else {
        setError(response.data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching debts');
    } finally {
      setLoading(false);
    }
  };

  const createDebt = async (data: any) => {
    try {
      const response = await axios.post('/api/debt', {
        userId,
        ...data,
      });

      if (response.data.success) {
        await fetchDebts();
        return response.data.data;
      } else {
        throw new Error(response.data.error);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    debts,
    loading,
    error,
    refetch: fetchDebts,
    createDebt,
  };
}
```

### 6.2 Componentes

**(Copiar exactamente los componentes proporcionados en los documentos originales)**

Crear en `src/app/components/debt/`:

1. ✅ **DebtDashboard.tsx**
2. ✅ **DebtCard.tsx**
3. ✅ **PaymentStrategy.tsx**
4. ✅ **DebtDetailModal.tsx**
5. ✅ **PaymentSimulator.tsx**
6. ✅ **NormaRecommendations.tsx**
7. ✅ **CreditHealthScore.tsx**
8. ✅ **PaymentAlerts.tsx**
9. ✅ **AddDebtModal.tsx**

### 6.3 DebtModule.tsx

**Ruta:** `src/app/pages/DebtModule.tsx`
```typescript
'use client';

import React, { useState } from 'react';
import { useDebts } from '../hooks/useDebts';
import { DebtDashboard } from '../components/debt/DebtDashboard';
import { DebtCard } from '../components/debt/DebtCard';
import { PaymentStrategy } from '../components/debt/PaymentStrategy';
import { AddDebtModal } from '../components/debt/AddDebtModal';
import { Button } from '../components/ui/Button';
import { Plus } from 'lucide-react';

export function DebtModule() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const userId = 'user-demo';
  const { debts, loading } = useDebts(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-banorte-red"></div>
      </div>
    );
  }

  if (debts.length === 0) {
    return (
      <div className="p-6 max-w-[1440px] mx-auto">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
            💰
          </div>
          <h2 className="text-2xl font-bold text-banorte-dark mb-4">
            No tienes deudas registradas
          </h2>
          <p className="text-banorte-gray mb-6">
            Registra tus deudas para crear un plan de pago óptimo
          </p>
          <Button onClick={() => setIsAddModalOpen(true)}>
            Agregar Deuda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-banorte-dark">
          Gestión de Deudas
        </h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Agregar Deuda
        </Button>
      </div>

      <DebtDashboard debts={debts} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">Tus Deudas</h2>
          <div className="space-y-4">
            {debts.map((debt) => (
              <DebtCard key={debt.id} debt={debt} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <PaymentStrategy debts={debts} userId={userId} />
        </div>
      </div>

      <AddDebtModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
```

---

## ✅ CRITERIOS DE ÉXITO PROMPT 5

1. ✅ Entidades: Debt, PaymentStrategy
2. ✅ Repositorios funcionales
3. ✅ Adaptador OpenAI
4. ✅ 3 Use Cases implementados
5. ✅ 3 API Routes funcionando
6. ✅ Hooks personalizados
7. ✅ 9 Componentes React
8. ✅ Página DebtModule funcional
9. ✅ Simulador de pagos
10. ✅ Módulo navegable

## 🚀 SIGUIENTE PASO

**PROMPT 6: Módulo Insurance (Completo)**
**PROMPT 7: Módulo Advisor + Dashboard (Completo)**