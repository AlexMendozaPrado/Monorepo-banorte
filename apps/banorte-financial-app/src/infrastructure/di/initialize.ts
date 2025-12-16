import { container } from './container';
import { registerBudgetModule } from './modules/budgetModule';
import { registerDebtModule } from './modules/debtModule';
import { registerInsuranceModule } from './modules/insuranceModule';
import { registerAdvisorModule } from './modules/advisorModule';

let isInitialized = false;

export function initializeDI(): void {
  if (isInitialized) {
    console.log('⚠️  DI Container already initialized');
    return;
  }

  console.log('🚀 Initializing DI Container...');

  // Register all modules
  registerBudgetModule(container);
  registerDebtModule(container);
  registerInsuranceModule(container);
  registerAdvisorModule(container);

  isInitialized = true;
  console.log('✅ DI Container initialized - ALL MODULES READY');
}

export function getDIContainer() {
  if (!isInitialized) {
    initializeDI();
  }
  return container;
}

export { container };

