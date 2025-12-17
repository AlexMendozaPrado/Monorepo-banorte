# PROMPT 6: Banorte Financial App - Módulo Insurance Completo

## 🎯 Objetivo del Prompt

Implementar completamente el módulo de Seguros (Insurance) incluyendo:
- Entidades de dominio (Insurance, Policy, Coverage)
- Use Cases con recomendaciones de IA
- Repositorios y adaptadores de IA
- API Routes completos
- Todos los componentes React del módulo
- Hooks personalizados
- Calculadora de cobertura
- Integración completa

## 📋 Prerrequisitos

✅ PROMPT 1, 2, 3, 4 y 5 completados

---

## 📂 Estructura del Módulo Insurance
```
src/
├── core/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── insurance/
│   │   │       ├── Insurance.ts
│   │   │       ├── Policy.ts
│   │   │       ├── Coverage.ts
│   │   │       └── InsuranceNeed.ts
│   │   └── ports/
│   │       ├── repositories/
│   │       │   └── IInsuranceRepository.ts
│   │       └── ai-services/
│   │           └── IInsuranceRecommenderPort.ts
│   ├── application/
│   │   ├── use-cases/
│   │   │   └── insurance/
│   │   │       ├── CreateInsuranceUseCase.ts
│   │   │       ├── EvaluateInsuranceNeedsUseCase.ts
│   │   │       ├── CompareInsuranceOptionsUseCase.ts
│   │   │       ├── CalculateCoverageUseCase.ts
│   │   │       └── RecommendInsuranceUseCase.ts
│   │   └── dtos/
│   │       └── insurance/
│   │           ├── InsuranceDTO.ts
│   │           ├── InsuranceNeedDTO.ts
│   │           └── CoverageDTO.ts
├── infrastructure/
│   ├── repositories/
│   │   └── in-memory/
│   │       └── InMemoryInsuranceRepository.ts
│   ├── ai/
│   │   └── providers/
│   │       └── openai/
│   │           └── OpenAIInsuranceRecommender.ts
│   └── di/
│       └── insuranceModule.ts
└── app/
    ├── api/
    │   └── insurance/
    │       ├── route.ts
    │       ├── evaluate/
    │       │   └── route.ts
    │       └── calculate/
    │           └── route.ts
    ├── components/
    │   └── insurance/
    │       ├── ProtectionDashboard.tsx
    │       ├── InsuranceCard.tsx
    │       ├── NeedsEvaluator.tsx
    │       ├── InsuranceComparator.tsx
    │       ├── CoverageCalculator.tsx
    │       ├── EducationSection.tsx
    │       ├── NormaInsuranceRecommendation.tsx
    │       └── QuoteModal.tsx
    ├── hooks/
    │   └── useInsurance.ts
    └── pages/
        └── InsuranceModule.tsx
```

---

## 📝 PARTE 1: DOMAIN LAYER - ENTIDADES

### 1.1 Insurance.ts

**Ruta:** `src/core/domain/entities/insurance/Insurance.ts`
```typescript
import { v4 as uuidv4 } from 'uuid';
import { Money } from '../../value-objects/financial/Money';
import { ValidationException, BusinessRuleException } from '../../exceptions';

export enum InsuranceType {
  LIFE = 'LIFE',
  HEALTH = 'HEALTH',
  AUTO = 'AUTO',
  HOME = 'HOME',
  DISABILITY = 'DISABILITY',
}

export enum InsuranceStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUAL = 'ANNUAL',
}

export interface CreateInsuranceData {
  userId: string;
  type: InsuranceType;
  provider: string;
  policyNumber: string;
  coverageAmount: Money;
  premium: Money;
  paymentFrequency: PaymentFrequency;
  startDate: Date;
  endDate: Date;
  beneficiaries?: string[];
}

export class Insurance {
  private _status: InsuranceStatus;
  private _lastPaymentDate?: Date;
  private readonly createdAt: Date;
  private updatedAt: Date;

  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: InsuranceType,
    public readonly provider: string,
    public readonly policyNumber: string,
    public readonly coverageAmount: Money,
    public readonly premium: Money,
    public readonly paymentFrequency: PaymentFrequency,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly beneficiaries: string[],
    status: InsuranceStatus = InsuranceStatus.ACTIVE
  ) {
    this._status = status;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.validate();
  }

  static create(data: CreateInsuranceData): Insurance {
    return new Insurance(
      uuidv4(),
      data.userId,
      data.type,
      data.provider,
      data.policyNumber,
      data.coverageAmount,
      data.premium,
      data.paymentFrequency,
      data.startDate,
      data.endDate,
      data.beneficiaries || [],
      InsuranceStatus.ACTIVE
    );
  }

  static reconstitute(
    id: string,
    userId: string,
    type: InsuranceType,
    provider: string,
    policyNumber: string,
    coverageAmount: Money,
    premium: Money,
    paymentFrequency: PaymentFrequency,
    startDate: Date,
    endDate: Date,
    beneficiaries: string[],
    status: InsuranceStatus,
    lastPaymentDate: Date | undefined,
    createdAt: Date,
    updatedAt: Date
  ): Insurance {
    const insurance = new Insurance(
      id,
      userId,
      type,
      provider,
      policyNumber,
      coverageAmount,
      premium,
      paymentFrequency,
      startDate,
      endDate,
      beneficiaries,
      status
    );
    insurance._lastPaymentDate = lastPaymentDate;
    (insurance as any).createdAt = createdAt;
    insurance.updatedAt = updatedAt;
    return insurance;
  }

  recordPayment(paymentDate: Date): void {
    if (this._status !== InsuranceStatus.ACTIVE) {
      throw new BusinessRuleException('Cannot record payment for inactive insurance');
    }
    this._lastPaymentDate = paymentDate;
    this.updatedAt = new Date();
  }

  cancel(): void {
    if (this._status === InsuranceStatus.CANCELLED) {
      throw new BusinessRuleException('Insurance is already cancelled');
    }
    this._status = InsuranceStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  renew(newEndDate: Date): void {
    if (this._status !== InsuranceStatus.ACTIVE && this._status !== InsuranceStatus.EXPIRED) {
      throw new BusinessRuleException('Can only renew active or expired insurance');
    }
    if (newEndDate <= this.endDate) {
      throw new ValidationException('New end date must be after current end date');
    }
    (this as any).endDate = newEndDate;
    this._status = InsuranceStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  addBeneficiary(beneficiary: string): void {
    if (this.beneficiaries.includes(beneficiary)) {
      throw new BusinessRuleException('Beneficiary already exists');
    }
    this.beneficiaries.push(beneficiary);
    this.updatedAt = new Date();
  }

  removeBeneficiary(beneficiary: string): void {
    const index = this.beneficiaries.indexOf(beneficiary);
    if (index === -1) {
      throw new BusinessRuleException('Beneficiary not found');
    }
    this.beneficiaries.splice(index, 1);
    this.updatedAt = new Date();
  }

  isExpired(): boolean {
    return new Date() > this.endDate;
  }

  isActive(): boolean {
    return this._status === InsuranceStatus.ACTIVE && !this.isExpired();
  }

  getDaysUntilExpiration(): number {
    const diff = this.endDate.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getAnnualPremium(): Money {
    switch (this.paymentFrequency) {
      case PaymentFrequency.MONTHLY:
        return this.premium.multiply(12);
      case PaymentFrequency.QUARTERLY:
        return this.premium.multiply(4);
      case PaymentFrequency.ANNUAL:
        return this.premium;
    }
  }

  getCoverageToIncomeRatio(annualIncome: Money): number {
    if (annualIncome.isZero()) return 0;
    return (this.coverageAmount.amount / annualIncome.amount);
  }

  get status(): InsuranceStatus {
    return this._status;
  }

  get lastPaymentDate(): Date | undefined {
    return this._lastPaymentDate;
  }

  private validate(): void {
    if (!this.provider || this.provider.trim().length === 0) {
      throw new ValidationException('Provider cannot be empty');
    }
    if (!this.policyNumber || this.policyNumber.trim().length === 0) {
      throw new ValidationException('Policy number cannot be empty');
    }
    if (this.coverageAmount.isNegative() || this.coverageAmount.isZero()) {
      throw new ValidationException('Coverage amount must be positive');
    }
    if (this.premium.isNegative()) {
      throw new ValidationException('Premium cannot be negative');
    }
    if (this.startDate >= this.endDate) {
      throw new ValidationException('Start date must be before end date');
    }
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      provider: this.provider,
      policyNumber: this.policyNumber,
      coverageAmount: this.coverageAmount.toJSON(),
      premium: this.premium.toJSON(),
      paymentFrequency: this.paymentFrequency,
      annualPremium: this.getAnnualPremium().toJSON(),
      startDate: this.startDate.toISOString(),
      endDate: this.endDate.toISOString(),
      beneficiaries: this.beneficiaries,
      status: this._status,
      isActive: this.isActive(),
      isExpired: this.isExpired(),
      daysUntilExpiration: this.getDaysUntilExpiration(),
      lastPaymentDate: this._lastPaymentDate?.toISOString(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
```

### 1.2 InsuranceNeed.ts

**Ruta:** `src/core/domain/entities/insurance/InsuranceNeed.ts`
```typescript
import { Money } from '../../value-objects/financial/Money';
import { InsuranceType } from './Insurance';

export enum NeedPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export interface LifeInsuranceFactors {
  age: number;
  dependents: number;
  annualIncome: Money;
  outstandingDebts: Money;
  existingCoverage: Money;
  yearsOfIncomeNeeded: number;
}

export class InsuranceNeed {
  static evaluateLifeInsurance(factors: LifeInsuranceFactors): {
    recommendedCoverage: Money;
    currentGap: Money;
    priority: NeedPriority;
    reasoning: string;
  } {
    // DIME method: Debt + Income + Mortgage + Education
    const incomeReplacement = factors.annualIncome.multiply(factors.yearsOfIncomeNeeded);
    const totalNeeded = incomeReplacement.add(factors.outstandingDebts);
    const gap = totalNeeded.subtract(factors.existingCoverage);

    let priority: NeedPriority;
    if (factors.dependents > 0 && gap.amount > factors.annualIncome.amount * 5) {
      priority = NeedPriority.CRITICAL;
    } else if (factors.dependents > 0 && gap.amount > factors.annualIncome.amount * 2) {
      priority = NeedPriority.HIGH;
    } else if (gap.amount > factors.annualIncome.amount) {
      priority = NeedPriority.MEDIUM;
    } else {
      priority = NeedPriority.LOW;
    }

    const reasoning = this.generateLifeInsuranceReasoning(factors, gap, priority);

    return {
      recommendedCoverage: totalNeeded,
      currentGap: gap,
      priority,
      reasoning,
    };
  }

  static evaluateDisabilityInsurance(
    annualIncome: Money,
    existingCoverage: Money,
    occupation: string
  ): {
    recommendedCoverage: Money;
    currentGap: Money;
    priority: NeedPriority;
    reasoning: string;
  } {
    // Standard: 60-70% of income
    const recommendedPercentage = 0.65;
    const monthlyIncome = annualIncome.divide(12);
    const recommendedMonthly = monthlyIncome.multiply(recommendedPercentage);
    const recommendedAnnual = recommendedMonthly.multiply(12);
    
    const gap = recommendedAnnual.subtract(existingCoverage);

    const priority = gap.amount > monthlyIncome.amount * 6 
      ? NeedPriority.HIGH 
      : NeedPriority.MEDIUM;

    return {
      recommendedCoverage: recommendedAnnual,
      currentGap: gap,
      priority,
      reasoning: `Se recomienda ${recommendedPercentage * 100}% de tu ingreso anual para protección por incapacidad`,
    };
  }

  static calculateCoverageAdequacy(
    insuranceType: InsuranceType,
    currentCoverage: Money,
    recommendedCoverage: Money
  ): {
    adequacyPercentage: number;
    status: 'EXCELLENT' | 'ADEQUATE' | 'INSUFFICIENT' | 'CRITICAL';
    message: string;
  } {
    if (recommendedCoverage.isZero()) {
      return {
        adequacyPercentage: 100,
        status: 'EXCELLENT',
        message: 'No se requiere cobertura adicional',
      };
    }

    const percentage = (currentCoverage.amount / recommendedCoverage.amount) * 100;

    let status: 'EXCELLENT' | 'ADEQUATE' | 'INSUFFICIENT' | 'CRITICAL';
    let message: string;

    if (percentage >= 100) {
      status = 'EXCELLENT';
      message = 'Tu cobertura es excelente';
    } else if (percentage >= 75) {
      status = 'ADEQUATE';
      message = 'Tu cobertura es adecuada pero podría mejorar';
    } else if (percentage >= 50) {
      status = 'INSUFFICIENT';
      message = 'Tu cobertura es insuficiente';
    } else {
      status = 'CRITICAL';
      message = 'Tu cobertura es críticamente baja';
    }

    return {
      adequacyPercentage: Math.round(percentage),
      status,
      message,
    };
  }

  private static generateLifeInsuranceReasoning(
    factors: LifeInsuranceFactors,
    gap: Money,
    priority: NeedPriority
  ): string {
    if (factors.dependents === 0) {
      return 'Sin dependientes, la cobertura puede ser menor. Considera cubrir deudas y gastos finales.';
    }

    if (priority === NeedPriority.CRITICAL) {
      return `Con ${factors.dependents} dependiente(s) y un déficit de cobertura de $${gap.amount.toFixed(0)}, es crítico aumentar tu seguro de vida.`;
    }

    return `Se recomienda ${factors.yearsOfIncomeNeeded} años de ingreso más deudas existentes para protección familiar adecuada.`;
  }
}
```

---

## 📝 PARTE 2: DOMAIN LAYER - PORTS

### 2.1 IInsuranceRepository.ts

**Ruta:** `src/core/domain/ports/repositories/IInsuranceRepository.ts`
```typescript
import { Insurance, InsuranceType, InsuranceStatus } from '../../entities/insurance/Insurance';

export interface IInsuranceRepository {
  save(insurance: Insurance): Promise<void>;
  findById(id: string): Promise<Insurance | null>;
  findByUser(userId: string): Promise<Insurance[]>;
  findByUserAndType(userId: string, type: InsuranceType): Promise<Insurance[]>;
  findByUserAndStatus(userId: string, status: InsuranceStatus): Promise<Insurance[]>;
  delete(id: string): Promise<void>;
  countByUser(userId: string): Promise<number>;
}
```

### 2.2 IInsuranceRecommenderPort.ts

**Ruta:** `src/core/domain/ports/ai-services/IInsuranceRecommenderPort.ts`
```typescript
import { Insurance, InsuranceType } from '../../entities/insurance/Insurance';
import { Money } from '../../value-objects/financial/Money';

export interface InsuranceRecommendation {
  type: InsuranceType;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedCoverage: Money;
  estimatedPremium: Money;
  reasoning: string;
  keyBenefits: string[];
  considerations: string[];
}

export interface InsuranceGapAnalysis {
  type: InsuranceType;
  currentCoverage: Money;
  recommendedCoverage: Money;
  gap: Money;
  adequacyPercentage: number;
  status: 'EXCELLENT' | 'ADEQUATE' | 'INSUFFICIENT' | 'CRITICAL';
}

export interface IInsuranceRecommenderPort {
  evaluateInsuranceNeeds(
    userProfile: {
      age: number;
      annualIncome: Money;
      dependents: number;
      maritalStatus: string;
      occupation: string;
      outstandingDebts: Money;
      hasHome: boolean;
      hasVehicle: boolean;
    },
    existingInsurance: Insurance[]
  ): Promise<{
    recommendations: InsuranceRecommendation[];
    gapAnalysis: InsuranceGapAnalysis[];
    priorityActions: string[];
  }>;

  compareInsuranceOptions(
    insuranceType: InsuranceType,
    coverageAmount: Money,
    userAge: number
  ): Promise<{
    options: {
      provider: string;
      estimatedPremium: Money;
      coverageAmount: Money;
      keyFeatures: string[];
      pros: string[];
      cons: string[];
      rating: number;
    }[];
    recommendation: string;
  }>;

  calculateOptimalCoverage(
    insuranceType: InsuranceType,
    userProfile: {
      age: number;
      annualIncome: Money;
      dependents: number;
      outstandingDebts: Money;
    }
  ): Promise<{
    recommendedAmount: Money;
    minAmount: Money;
    maxAmount: Money;
    reasoning: string;
    monthlyPremiumEstimate: Money;
  }>;
}
```

---

## 📝 PARTE 3: APPLICATION LAYER - USE CASES

### 3.1 CreateInsuranceUseCase.ts

**Ruta:** `src/core/application/use-cases/insurance/CreateInsuranceUseCase.ts`
```typescript
import { IInsuranceRepository } from '@/core/domain/ports/repositories/IInsuranceRepository';
import { Insurance, InsuranceType, PaymentFrequency } from '@/core/domain/entities/insurance/Insurance';
import { Money } from '@/core/domain/value-objects/financial/Money';

export interface CreateInsuranceDTO {
  userId: string;
  type: string;
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  premium: number;
  paymentFrequency: string;
  startDate: string;
  endDate: string;
  beneficiaries?: string[];
  currency?: string;
}

export class CreateInsuranceUseCase {
  constructor(
    private readonly insuranceRepository: IInsuranceRepository
  ) {}

  async execute(dto: CreateInsuranceDTO) {
    const currency = dto.currency || 'MXN';

    const insurance = Insurance.create({
      userId: dto.userId,
      type: dto.type as InsuranceType,
      provider: dto.provider,
      policyNumber: dto.policyNumber,
      coverageAmount: Money.fromAmount(dto.coverageAmount, currency as any),
      premium: Money.fromAmount(dto.premium, currency as any),
      paymentFrequency: dto.paymentFrequency as PaymentFrequency,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      beneficiaries: dto.beneficiaries,
    });

    await this.insuranceRepository.save(insurance);

    return insurance.toJSON();
  }
}
```

### 3.2 EvaluateInsuranceNeedsUseCase.ts

**Ruta:** `src/core/application/use-cases/insurance/EvaluateInsuranceNeedsUseCase.ts`
```typescript
import { IInsuranceRepository } from '@/core/domain/ports/repositories/IInsuranceRepository';
import { IInsuranceRecommenderPort } from '@/core/domain/ports/ai-services/IInsuranceRecommenderPort';
import { Money } from '@/core/domain/value-objects/financial/Money';

export interface EvaluateNeedsDTO {
  userId: string;
  age: number;
  annualIncome: number;
  dependents: number;
  maritalStatus: string;
  occupation: string;
  outstandingDebts: number;
  hasHome: boolean;
  hasVehicle: boolean;
  currency?: string;
}

export class EvaluateInsuranceNeedsUseCase {
  constructor(
    private readonly insuranceRepository: IInsuranceRepository,
    private readonly insuranceRecommender: IInsuranceRecommenderPort
  ) {}

  async execute(dto: EvaluateNeedsDTO) {
    const currency = dto.currency || 'MXN';
    const existingInsurance = await this.insuranceRepository.findByUser(dto.userId);

    const evaluation = await this.insuranceRecommender.evaluateInsuranceNeeds(
      {
        age: dto.age,
        annualIncome: Money.fromAmount(dto.annualIncome, currency as any),
        dependents: dto.dependents,
        maritalStatus: dto.maritalStatus,
        occupation: dto.occupation,
        outstandingDebts: Money.fromAmount(dto.outstandingDebts, currency as any),
        hasHome: dto.hasHome,
        hasVehicle: dto.hasVehicle,
      },
      existingInsurance
    );

    return {
      ...evaluation,
      existingPoliciesCount: existingInsurance.length,
    };
  }
}
```

### 3.3 CalculateCoverageUseCase.ts

**Ruta:** `src/core/application/use-cases/insurance/CalculateCoverageUseCase.ts`
```typescript
import { IInsuranceRecommenderPort } from '@/core/domain/ports/ai-services/IInsuranceRecommenderPort';
import { InsuranceType } from '@/core/domain/entities/insurance/Insurance';
import { Money } from '@/core/domain/value-objects/financial/Money';

export interface CalculateCoverageDTO {
  insuranceType: string;
  age: number;
  annualIncome: number;
  dependents: number;
  outstandingDebts: number;
  currency?: string;
}

export class CalculateCoverageUseCase {
  constructor(
    private readonly insuranceRecommender: IInsuranceRecommenderPort
  ) {}

  async execute(dto: CalculateCoverageDTO) {
    const currency = dto.currency || 'MXN';

    const result = await this.insuranceRecommender.calculateOptimalCoverage(
      dto.insuranceType as InsuranceType,
      {
        age: dto.age,
        annualIncome: Money.fromAmount(dto.annualIncome, currency as any),
        dependents: dto.dependents,
        outstandingDebts: Money.fromAmount(dto.outstandingDebts, currency as any),
      }
    );

    return {
      recommendedAmount: result.recommendedAmount.toJSON(),
      minAmount: result.minAmount.toJSON(),
      maxAmount: result.maxAmount.toJSON(),
      reasoning: result.reasoning,
      monthlyPremiumEstimate: result.monthlyPremiumEstimate.toJSON(),
    };
  }
}
```

---

## 📝 PARTE 4: INFRASTRUCTURE LAYER

### 4.1 InMemoryInsuranceRepository.ts

**Ruta:** `src/infrastructure/repositories/in-memory/InMemoryInsuranceRepository.ts`
```typescript
import { IInsuranceRepository } from '@/core/domain/ports/repositories/IInsuranceRepository';
import { Insurance, InsuranceType, InsuranceStatus } from '@/core/domain/entities/insurance/Insurance';

export class InMemoryInsuranceRepository implements IInsuranceRepository {
  private insurances: Map<string, Insurance> = new Map();

  async save(insurance: Insurance): Promise<void> {
    this.insurances.set(insurance.id, insurance);
  }

  async findById(id: string): Promise<Insurance | null> {
    return this.insurances.get(id) || null;
  }

  async findByUser(userId: string): Promise<Insurance[]> {
    return Array.from(this.insurances.values())
      .filter(i => i.userId === userId)
      .sort((a, b) => {
        // Active first, then by type
        if (a.status !== b.status) {
          return a.status === InsuranceStatus.ACTIVE ? -1 : 1;
        }
        return a.type.localeCompare(b.type);
      });
  }

  async findByUserAndType(userId: string, type: InsuranceType): Promise<Insurance[]> {
    return Array.from(this.insurances.values())
      .filter(i => i.userId === userId && i.type === type);
  }

  async findByUserAndStatus(userId: string, status: InsuranceStatus): Promise<Insurance[]> {
    return Array.from(this.insurances.values())
      .filter(i => i.userId === userId && i.status === status);
  }

  async delete(id: string): Promise<void> {
    this.insurances.delete(id);
  }

  async countByUser(userId: string): Promise<number> {
    return Array.from(this.insurances.values())
      .filter(i => i.userId === userId).length;
  }

  clear(): void {
    this.insurances.clear();
  }
}
```

### 4.2 OpenAIInsuranceRecommender.ts

**Ruta:** `src/infrastructure/ai/providers/openai/OpenAIInsuranceRecommender.ts`
```typescript
import { IInsuranceRecommenderPort, InsuranceRecommendation, InsuranceGapAnalysis } from '@/core/domain/ports/ai-services/IInsuranceRecommenderPort';
import { Insurance, InsuranceType } from '@/core/domain/entities/insurance/Insurance';
import { Money } from '@/core/domain/value-objects/financial/Money';
import { InsuranceNeed } from '@/core/domain/entities/insurance/InsuranceNeed';
import { OpenAIConfig } from './OpenAIConfig';

export class OpenAIInsuranceRecommender implements IInsuranceRecommenderPort {
  private config: ReturnType<OpenAIConfig['getConfig']>;

  constructor() {
    const configInstance = OpenAIConfig.getInstance();
    this.config = configInstance.getConfig();
  }

  async evaluateInsuranceNeeds(
    userProfile: any,
    existingInsurance: Insurance[]
  ) {
    const recommendations: InsuranceRecommendation[] = [];
    const gapAnalysis: InsuranceGapAnalysis[] = [];

    // Life Insurance
    const lifeInsurance = existingInsurance.find(i => i.type === InsuranceType.LIFE);
    const lifeEvaluation = InsuranceNeed.evaluateLifeInsurance({
      age: userProfile.age,
      dependents: userProfile.dependents,
      annualIncome: userProfile.annualIncome,
      outstandingDebts: userProfile.outstandingDebts,
      existingCoverage: lifeInsurance?.coverageAmount || Money.zero(),
      yearsOfIncomeNeeded: 10,
    });

    if (lifeEvaluation.currentGap.amount > 0) {
      recommendations.push({
        type: InsuranceType.LIFE,
        priority: lifeEvaluation.priority,
        recommendedCoverage: lifeEvaluation.recommendedCoverage,
        estimatedPremium: Money.fromAmount(userProfile.annualIncome.amount * 0.01),
        reasoning: lifeEvaluation.reasoning,
        keyBenefits: [
          'Protección financiera para dependientes',
          'Cobertura de deudas pendientes',
          'Gastos finales cubiertos',
        ],
        considerations: [
          'Revisar anualmente',
          'Actualizar beneficiarios',
        ],
      });
    }

    const adequacy = InsuranceNeed.calculateCoverageAdequacy(
      InsuranceType.LIFE,
      lifeInsurance?.coverageAmount || Money.zero(),
      lifeEvaluation.recommendedCoverage
    );

    gapAnalysis.push({
      type: InsuranceType.LIFE,
      currentCoverage: lifeInsurance?.coverageAmount || Money.zero(),
      recommendedCoverage: lifeEvaluation.recommendedCoverage,
      gap: lifeEvaluation.currentGap,
      adequacyPercentage: adequacy.adequacyPercentage,
      status: adequacy.status,
    });

    const priorityActions = recommendations
      .filter(r => r.priority === 'CRITICAL' || r.priority === 'HIGH')
      .map(r => `Obtener seguro de ${this.getInsuranceTypeName(r.type)}`);

    return {
      recommendations,
      gapAnalysis,
      priorityActions,
    };
  }

  async compareInsuranceOptions(
    insuranceType: InsuranceType,
    coverageAmount: Money,
    userAge: number
  ) {
    // Mock implementation
    const basePremium = (coverageAmount.amount / 1000) * (userAge / 100);

    const options = [
      {
        provider: 'Banorte Seguros',
        estimatedPremium: Money.fromAmount(basePremium * 0.9),
        coverageAmount,
        keyFeatures: ['Cobertura completa', 'Sin período de espera'],
        pros: ['Mejor precio', 'Servicio en línea'],
        cons: ['Red de proveedores limitada'],
        rating: 4.5,
      },
      {
        provider: 'Seguros Monterrey',
        estimatedPremium: Money.fromAmount(basePremium),
        coverageAmount,
        keyFeatures: ['Red amplia', 'Cobertura internacional'],
        pros: ['Mejor cobertura', 'Red internacional'],
        cons: ['Más costoso'],
        rating: 4.7,
      },
    ];

    return {
      options,
      recommendation: 'Banorte Seguros ofrece la mejor relación precio-valor',
    };
  }

  async calculateOptimalCoverage(
    insuranceType: InsuranceType,
    userProfile: any
  ) {
    let recommendedAmount: Money;
    let reasoning: string;

    switch (insuranceType) {
      case InsuranceType.LIFE:
        const multiplier = 10; // 10x annual income
        recommendedAmount = userProfile.annualIncome.multiply(multiplier).add(userProfile.outstandingDebts);
        reasoning = `${multiplier}x ingreso anual más deudas pendientes`;
        break;

      case InsuranceType.DISABILITY:
        recommendedAmount = userProfile.annualIncome.multiply(0.65);
        reasoning = '65% del ingreso anual';
        break;

      default:
        recommendedAmount = userProfile.annualIncome.multiply(5);
        reasoning = '5x ingreso anual (estándar)';
    }

    const minAmount = recommendedAmount.multiply(0.5);
    const maxAmount = recommendedAmount.multiply(1.5);
    const monthlyPremium = recommendedAmount.multiply(0.01).divide(12);

    return {
      recommendedAmount,
      minAmount,
      maxAmount,
      reasoning,
      monthlyPremiumEstimate: monthlyPremium,
    };
  }

  private getInsuranceTypeName(type: InsuranceType): string {
    const names = {
      [InsuranceType.LIFE]: 'Vida',
      [InsuranceType.HEALTH]: 'Salud',
      [InsuranceType.AUTO]: 'Auto',
      [InsuranceType.HOME]: 'Hogar',
      [InsuranceType.DISABILITY]: 'Incapacidad',
    };
    return names[type];
  }
}
```

---

## 📝 PARTE 5: DI MODULE Y API ROUTES

### 5.1 insuranceModule.ts

**Ruta:** `src/infrastructure/di/insuranceModule.ts`
```typescript
import { DIContainer } from './container';
import { CreateInsuranceUseCase } from '@/core/application/use-cases/insurance/CreateInsuranceUseCase';
import { EvaluateInsuranceNeedsUseCase } from '@/core/application/use-cases/insurance/EvaluateInsuranceNeedsUseCase';
import { CalculateCoverageUseCase } from '@/core/application/use-cases/insurance/CalculateCoverageUseCase';
import { InMemoryInsuranceRepository } from '@/infrastructure/repositories/in-memory/InMemoryInsuranceRepository';
import { OpenAIInsuranceRecommender } from '@/infrastructure/ai/providers/openai/OpenAIInsuranceRecommender';

export function registerInsuranceModule(container: DIContainer): void {
  console.log('📦 Registering Insurance Module...');

  // Repositories
  container.register('IInsuranceRepository', () => new InMemoryInsuranceRepository());

  // AI Services
  container.register('IInsuranceRecommenderPort', () => new OpenAIInsuranceRecommender());

  // Use Cases
  container.register('CreateInsuranceUseCase', () => {
    return new CreateInsuranceUseCase(
      container.resolve('IInsuranceRepository')
    );
  });

  container.register('EvaluateInsuranceNeedsUseCase', () => {
    return new EvaluateInsuranceNeedsUseCase(
      container.resolve('IInsuranceRepository'),
      container.resolve('IInsuranceRecommenderPort')
    );
  });

  container.register('CalculateCoverageUseCase', () => {
    return new CalculateCoverageUseCase(
      container.resolve('IInsuranceRecommenderPort')
    );
  });

  console.log('✅ Insurance Module registered');
}
```

### 5.2 Actualizar DI index.ts:
```typescript
import { container } from './container';
import { registerBudgetModule } from './budgetModule';
import { registerSavingsModule } from './savingsModule';
import { registerCardsModule } from './cardsModule';
import { registerDebtModule } from './debtModule';
import { registerInsuranceModule } from './insuranceModule';

export function initializeDI(): void {
  console.log('🚀 Initializing DI Container...');
  
  registerBudgetModule(container);
  registerSavingsModule(container);
  registerCardsModule(container);
  registerDebtModule(container);
  registerInsuranceModule(container);
  
  console.log('✅ DI Container initialized');
}

export { container };
```

### 5.3 API Routes

**Ruta:** `src/app/api/insurance/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di';
import { CreateInsuranceUseCase } from '@/core/application/use-cases/insurance/CreateInsuranceUseCase';
import { IInsuranceRepository } from '@/core/domain/ports/repositories/IInsuranceRepository';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useCase = container.resolve<CreateInsuranceUseCase>('CreateInsuranceUseCase');
    const result = await useCase.execute(body);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error creating insurance:', error);
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

    const repository = container.resolve<IInsuranceRepository>('IInsuranceRepository');
    const insurances = await repository.findByUser(userId);

    return NextResponse.json({
      success: true,
      data: insurances.map(i => i.toJSON()),
    });
  } catch (error: any) {
    console.error('Error fetching insurance:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Ruta:** `src/app/api/insurance/evaluate/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di';
import { EvaluateInsuranceNeedsUseCase } from '@/core/application/use-cases/insurance/EvaluateInsuranceNeedsUseCase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useCase = container.resolve<EvaluateInsuranceNeedsUseCase>('EvaluateInsuranceNeedsUseCase');
    const result = await useCase.execute(body);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error evaluating insurance needs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Ruta:** `src/app/api/insurance/calculate/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/infrastructure/di';
import { CalculateCoverageUseCase } from '@/core/application/use-cases/insurance/CalculateCoverageUseCase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const useCase = container.resolve<CalculateCoverageUseCase>('CalculateCoverageUseCase');
    const result = await useCase.execute(body);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error calculating coverage:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 📝 PARTE 6: HOOKS, COMPONENTES Y PÁGINA

### 6.1 useInsurance.ts

**Ruta:** `src/app/hooks/useInsurance.ts`
```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useInsurance(userId: string) {
  const [insurances, setInsurances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchInsurances();
    }
  }, [userId]);

  const fetchInsurances = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/insurance?userId=${userId}`);

      if (response.data.success) {
        setInsurances(response.data.data);
      } else {
        setError(response.data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching insurance');
    } finally {
      setLoading(false);
    }
  };

  return {
    insurances,
    loading,
    error,
    refetch: fetchInsurances,
  };
}
```

### 6.2 Componentes

**(Copiar exactamente los componentes proporcionados en los documentos originales)**

Crear en `src/app/components/insurance/`:

1. ✅ **ProtectionDashboard.tsx**
2. ✅ **InsuranceCard.tsx**
3. ✅ **NeedsEvaluator.tsx**
4. ✅ **InsuranceComparator.tsx**
5. ✅ **CoverageCalculator.tsx**
6. ✅ **EducationSection.tsx**
7. ✅ **NormaInsuranceRecommendation.tsx**
8. ✅ **QuoteModal.tsx**

### 6.3 InsuranceModule.tsx

**Ruta:** `src/app/pages/InsuranceModule.tsx`
```typescript
'use client';

import React, { useState } from 'react';
import { useInsurance } from '../hooks/useInsurance';
import { ProtectionDashboard } from '../components/insurance/ProtectionDashboard';
import { InsuranceCard } from '../components/insurance/InsuranceCard';
import { NeedsEvaluator } from '../components/insurance/NeedsEvaluator';
import { Button } from '../components/ui/Button';

export function InsuranceModule() {
  const [showEvaluator, setShowEvaluator] = useState(false);
  const userId = 'user-demo';
  const { insurances, loading } = useInsurance(userId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-banorte-red"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1440px] mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-banorte-dark">
          Centro de Seguros
        </h1>
        <Button onClick={() => setShowEvaluator(true)}>
          Evaluar Necesidades
        </Button>
      </div>

      <ProtectionDashboard insurances={insurances} />

      {insurances.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insurances.map((insurance) => (
            <InsuranceCard key={insurance.id} insurance={insurance} />
          ))}
        </div>
      )}

      {showEvaluator && (
        <NeedsEvaluator
          userId={userId}
          onClose={() => setShowEvaluator(false)}
        />
      )}
    </div>
  );
}
```

---

## ✅ CRITERIOS DE ÉXITO PROMPT 6

1. ✅ Entidades: Insurance, InsuranceNeed
2. ✅ Repositorios funcionales
3. ✅ Adaptador OpenAI
4. ✅ 3 Use Cases implementados
5. ✅ 3 API Routes funcionando
6. ✅ Hooks personalizados
7. ✅ 8 Componentes React
8. ✅ Página InsuranceModule funcional
9. ✅ Evaluador de necesidades
10. ✅ Módulo navegable

## 🚀 ÚLTIMO PASO

**PROMPT 7: Módulo Advisor + Dashboard (Completo y Final)**