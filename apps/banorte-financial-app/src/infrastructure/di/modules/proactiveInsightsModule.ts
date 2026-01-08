import { DIContainer } from '../container';
import { OpenAIProactiveInsightsEngine } from '@/infrastructure/ai/providers/openai/OpenAIProactiveInsightsEngine';
import { GenerateProactiveInsightsUseCase } from '@/core/application/use-cases/advisor/GenerateProactiveInsightsUseCase';

/**
 * Registra el módulo de Insights Proactivos en el contenedor DI
 *
 * Dependencias requeridas (deben registrarse antes):
 * - IExpenseAnalyzerPort (budgetModule)
 * - ISavingsOptimizerPort (savingsModule)
 * - IDebtStrategyPort (debtModule)
 * - IBudgetRepository (budgetModule)
 * - ITransactionRepository (budgetModule)
 * - ISavingsGoalRepository (savingsModule)
 * - ISavingsRuleRepository (savingsModule)
 * - IDebtRepository (debtModule)
 */
export function registerProactiveInsightsModule(container: DIContainer): void {
  console.log('📦 Registering Proactive Insights Module...');

  // AI Engine - Orquestador de servicios existentes (Singleton)
  container.register(
    'IProactiveInsightsPort',
    () => {
      return new OpenAIProactiveInsightsEngine(
        container.resolve('IExpenseAnalyzerPort'),
        container.resolve('ISavingsOptimizerPort'),
        container.resolve('IDebtStrategyPort')
      );
    },
    true
  );

  // Use Case - Nueva instancia por request
  container.register(
    'GenerateProactiveInsightsUseCase',
    () => {
      return new GenerateProactiveInsightsUseCase(
        container.resolve('IProactiveInsightsPort'),
        container.resolve('IBudgetRepository'),
        container.resolve('ITransactionRepository'),
        container.resolve('ISavingsGoalRepository'),
        container.resolve('ISavingsRuleRepository'),
        container.resolve('IDebtRepository')
      );
    },
    false
  );

  console.log('✅ Proactive Insights Module registered successfully');
}
