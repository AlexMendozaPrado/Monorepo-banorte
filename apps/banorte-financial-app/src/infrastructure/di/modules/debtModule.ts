import { DIContainer } from '../container';
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
    return new CreateDebtUseCase(container.resolve('IDebtRepository'));
  });

  container.register('CalculatePaymentStrategyUseCase', () => {
    return new CalculatePaymentStrategyUseCase(container.resolve('IDebtRepository'));
  });

  container.register('SimulateExtraPaymentUseCase', () => {
    return new SimulateExtraPaymentUseCase(container.resolve('IDebtRepository'));
  });

  console.log('✅ Debt Module registered');
}

