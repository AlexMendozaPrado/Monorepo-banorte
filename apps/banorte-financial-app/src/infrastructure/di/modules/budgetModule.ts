import { DIContainer } from '../container';
import { CreateBudgetUseCase } from '@/core/application/use-cases/budget/CreateBudgetUseCase';
import { DetectAntExpensesUseCase } from '@/core/application/use-cases/budget/DetectAntExpensesUseCase';
import { GetBudgetSummaryUseCase } from '@/core/application/use-cases/budget/GetBudgetSummaryUseCase';
import { InMemoryBudgetRepository } from '@/infrastructure/repositories/InMemoryBudgetRepository';
import { InMemoryTransactionRepository } from '@/infrastructure/repositories/InMemoryTransactionRepository';
import { OpenAIExpenseAnalyzer } from '@/infrastructure/ai/providers/openai/OpenAIExpenseAnalyzer';

export function registerBudgetModule(container: DIContainer): void {
  console.log('📦 Registering Budget Module...');

  // Repositories (Singletons to maintain state in memory)
  container.register('IBudgetRepository', () => new InMemoryBudgetRepository(), true);
  container.register('ITransactionRepository', () => new InMemoryTransactionRepository(), true);

  // AI Services (Singleton for configuration caching)
  container.register('IExpenseAnalyzerPort', () => new OpenAIExpenseAnalyzer(), true);

  // Use Cases (New instance per request for clean state)
  container.register('CreateBudgetUseCase', () => {
    return new CreateBudgetUseCase(
      container.resolve('IBudgetRepository')
    );
  }, false);

  container.register('DetectAntExpensesUseCase', () => {
    return new DetectAntExpensesUseCase(
      container.resolve('ITransactionRepository'),
      container.resolve('IExpenseAnalyzerPort'),
      container.resolve('IBudgetRepository')
    );
  }, false);

  container.register('GetBudgetSummaryUseCase', () => {
    return new GetBudgetSummaryUseCase(
      container.resolve('IBudgetRepository'),
      container.resolve('ITransactionRepository')
    );
  }, false);

  console.log('✅ Budget Module registered successfully');
}

