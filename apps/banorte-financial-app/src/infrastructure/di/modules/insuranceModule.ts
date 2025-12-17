import { DIContainer } from '../container';
import { CreateInsuranceUseCase } from '@/core/application/use-cases/insurance/CreateInsuranceUseCase';
import { EvaluateInsuranceNeedsUseCase } from '@/core/application/use-cases/insurance/EvaluateInsuranceNeedsUseCase';
import { CalculateCoverageUseCase } from '@/core/application/use-cases/insurance/CalculateCoverageUseCase';
import { InMemoryInsuranceRepository } from '@/infrastructure/repositories/in-memory/InMemoryInsuranceRepository';
import { OpenAIInsuranceRecommender } from '@/infrastructure/ai/providers/openai/OpenAIInsuranceRecommender';

export function registerInsuranceModule(container: DIContainer): void {
  console.log('📦 Registering Insurance Module...');

  // Repositories (Singleton to maintain state in memory)
  container.register('IInsuranceRepository', () => new InMemoryInsuranceRepository(), true);

  // AI Services (Singleton for configuration caching)
  container.register('IInsuranceRecommenderPort', () => new OpenAIInsuranceRecommender(), true);

  // Use Cases (New instance per request)
  container.register('CreateInsuranceUseCase', () => {
    return new CreateInsuranceUseCase(
      container.resolve('IInsuranceRepository')
    );
  }, false);

  container.register('EvaluateInsuranceNeedsUseCase', () => {
    return new EvaluateInsuranceNeedsUseCase(
      container.resolve('IInsuranceRepository'),
      container.resolve('IInsuranceRecommenderPort')
    );
  }, false);

  container.register('CalculateCoverageUseCase', () => {
    return new CalculateCoverageUseCase(
      container.resolve('IInsuranceRecommenderPort')
    );
  }, false);

  console.log('✅ Insurance Module registered');
}

