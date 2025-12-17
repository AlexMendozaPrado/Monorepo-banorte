import { DIContainer } from '../container';
import { SendMessageUseCase } from '@/core/application/use-cases/advisor/SendMessageUseCase';
import { GetFinancialSummaryUseCase } from '@/core/application/use-cases/dashboard/GetFinancialSummaryUseCase';
import { OpenAIFinancialAdvisor } from '@/infrastructure/ai/providers/openai/OpenAIFinancialAdvisor';

export function registerAdvisorModule(container: DIContainer): void {
  console.log('📦 Registering Advisor Module...');

  // AI Services
  container.register('IFinancialAdvisorPort', () => new OpenAIFinancialAdvisor(), true);

  // Use Cases
  container.register('SendMessageUseCase', () => {
    return new SendMessageUseCase(
      container.resolve('IFinancialAdvisorPort')
    );
  }, true);

  container.register('GetFinancialSummaryUseCase', () => {
    return new GetFinancialSummaryUseCase();
  }, true);

  console.log('✅ Advisor Module registered');
}

