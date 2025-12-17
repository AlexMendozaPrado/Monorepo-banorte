import { container } from './container';
import { registerBudgetModule } from './modules/budgetModule';
import { registerDebtModule } from './modules/debtModule';
import { registerInsuranceModule } from './modules/insuranceModule';
import { registerAdvisorModule } from './modules/advisorModule';
import { OpenAIConfig } from '../ai/providers/openai/OpenAIConfig';

let isInitialized = false;

export function initializeDI(): void {
  if (isInitialized) {
    console.log('⚠️  DI Container already initialized');
    return;
  }

  console.log('🚀 Initializing DI Container...');

  // Validate OpenAI configuration BEFORE registering services
  try {
    const config = OpenAIConfig.getInstance();
    console.log('✅ OpenAI configuration loaded');
  } catch (error: any) {
    console.error('❌ Failed to load OpenAI configuration:', error.message);
    throw error; // Stop initialization if OpenAI config is invalid
  }

  // Register all modules
  registerBudgetModule(container);
  registerDebtModule(container);
  registerInsuranceModule(container);
  registerAdvisorModule(container);

  // Validate that all critical services are registered
  container.validate([
    'IFinancialAdvisorPort',
    'IExpenseAnalyzerPort',
    'IDebtStrategyPort',
    'SendMessageUseCase',
    'DetectAntExpensesUseCase',
  ]);

  isInitialized = true;
  console.log('✅ DI Container initialized - ALL MODULES READY');
}

export function getDIContainer() {
  if (!isInitialized) {
    initializeDI();
  }
  return container;
}

export async function healthCheckAI(): Promise<{
  status: 'healthy' | 'unhealthy';
  services: Record<string, boolean>;
}> {
  try {
    const config = OpenAIConfig.getInstance();
    const isConnected = await config.verifyConnection();

    return {
      status: isConnected ? 'healthy' : 'unhealthy',
      services: { openai: isConnected },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      services: { openai: false },
    };
  }
}

export { container };

