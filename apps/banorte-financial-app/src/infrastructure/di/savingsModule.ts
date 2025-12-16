import { DIContainer } from './container';
import { CreateSavingsGoalUseCase } from '@/core/application/use-cases/savings/CreateSavingsGoalUseCase';
import { CreateSavingsRuleUseCase } from '@/core/application/use-cases/savings/CreateSavingsRuleUseCase';
import { SimulateSavingsImpactUseCase } from '@/core/application/use-cases/savings/SimulateSavingsImpactUseCase';
import { CalculateEmergencyFundUseCase } from '@/core/application/use-cases/savings/CalculateEmergencyFundUseCase';
import { InMemorySavingsGoalRepository } from '@/infrastructure/repositories/in-memory/InMemorySavingsGoalRepository';
import { InMemorySavingsRuleRepository } from '@/infrastructure/repositories/in-memory/InMemorySavingsRuleRepository';
import { OpenAISavingsOptimizer } from '@/infrastructure/ai/providers/openai/OpenAISavingsOptimizer';

export function registerSavingsModule(container: DIContainer): void {
  console.log('📦 Registering Savings Module...');

  // Repositories
  container.register('ISavingsGoalRepository', () => new InMemorySavingsGoalRepository());
  container.register('ISavingsRuleRepository', () => new InMemorySavingsRuleRepository());

  // AI Services
  container.register('ISavingsOptimizerPort', () => new OpenAISavingsOptimizer());

  // Use Cases
  container.register('CreateSavingsGoalUseCase', () => {
    return new CreateSavingsGoalUseCase(
      container.resolve('ISavingsGoalRepository')
    );
  });

  container.register('CreateSavingsRuleUseCase', () => {
    return new CreateSavingsRuleUseCase(
      container.resolve('ISavingsRuleRepository'),
      container.resolve('ISavingsGoalRepository')
    );
  });

  container.register('SimulateSavingsImpactUseCase', () => {
    return new SimulateSavingsImpactUseCase(
      container.resolve('ISavingsGoalRepository'),
      container.resolve('ISavingsOptimizerPort')
    );
  });

  container.register('CalculateEmergencyFundUseCase', () => {
    return new CalculateEmergencyFundUseCase();
  });

  console.log('✅ Savings Module registered');
}
