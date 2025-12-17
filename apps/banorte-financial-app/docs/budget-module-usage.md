# Budget Module - Usage Guide

## Overview
The Budget Module is built using Clean Architecture principles with full Dependency Injection support and AI-powered expense analysis.

## Quick Start

### 1. Initialize the DI Container

```typescript
import { initializeDI, getDIContainer } from '@/infrastructure/di';

// Initialize once at app startup
initializeDI();

// Get the container instance
const container = getDIContainer();
```

### 2. Resolve Use Cases

```typescript
import { CreateBudgetUseCase } from '@/core/application/use-cases/budget';
import { getDIContainer } from '@/infrastructure/di';

const container = getDIContainer();
const createBudgetUseCase = container.resolve<CreateBudgetUseCase>('CreateBudgetUseCase');
```

### 3. Create a Budget

```typescript
import { CreateBudgetDTO } from '@/core/application/dtos/budget';

const budgetDTO: CreateBudgetDTO = {
  userId: 'user-123',
  month: new Date('2024-01-01'),
  totalIncome: 25000,
  currency: 'MXN',
  categories: [
    { name: 'Alimentación', budgeted: 5000, icon: '🍔', color: '#FF6B6B' },
    { name: 'Transporte', budgeted: 2000, icon: '🚗', color: '#4ECDC4' },
    { name: 'Entretenimiento', budgeted: 1500, icon: '🎬', color: '#95E1D3' },
  ],
};

const budget = await createBudgetUseCase.execute(budgetDTO);
console.log('Budget created:', budget);
```

### 4. Detect Ant Expenses (AI-Powered)

```typescript
import { DetectAntExpensesUseCase } from '@/core/application/use-cases/budget';

const detectAntExpensesUseCase = container.resolve<DetectAntExpensesUseCase>('DetectAntExpensesUseCase');

const analysis = await detectAntExpensesUseCase.execute('user-123', 1); // Last 1 month
console.log('Ant expenses detected:', analysis.antExpenses);
console.log('Total monthly impact:', analysis.totalMonthlyImpact);
console.log('Potential savings:', analysis.potentialSavings);
```

### 5. Get Budget Summary

```typescript
import { GetBudgetSummaryUseCase } from '@/core/application/use-cases/budget';

const getBudgetSummaryUseCase = container.resolve<GetBudgetSummaryUseCase>('GetBudgetSummaryUseCase');

const summary = await getBudgetSummaryUseCase.execute('user-123');
console.log('Budget summary:', summary);
console.log('Alerts:', summary.alerts);
console.log('Recent transactions:', summary.recentTransactions);
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.3
```

**Note:** If `OPENAI_API_KEY` is not set, the system will use mock data for AI features.

## Architecture

```
src/
├── core/
│   ├── domain/              # Business logic & entities
│   │   ├── entities/
│   │   ├── ports/
│   │   └── value-objects/
│   └── application/         # Use cases & DTOs
│       ├── dtos/
│       └── use-cases/
└── infrastructure/          # External implementations
    ├── ai/                  # AI providers (OpenAI)
    ├── repositories/        # Data persistence
    └── di/                  # Dependency Injection
```

## Testing

The module includes in-memory repositories for easy testing without database dependencies:

```typescript
import { InMemoryBudgetRepository } from '@/infrastructure/repositories';

const repository = new InMemoryBudgetRepository();
// Use for testing
```

## Next Steps

1. **API Routes**: Create Next.js API routes that use these use cases
2. **React Components**: Build UI components that consume the DTOs
3. **Real Database**: Replace in-memory repositories with real database implementations
4. **Additional Use Cases**: Implement update, delete, and analytics use cases

