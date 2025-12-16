import { container } from './container';
import { registerBudgetModule } from './modules/budgetModule';

let isInitialized = false;

export function initializeDI(): void {
  if (isInitialized) {
    console.log('⚠️  DI Container already initialized');
    return;
  }

  console.log('🚀 Initializing DI Container...');
  
  // Register all modules
  registerBudgetModule(container);
  
  isInitialized = true;
  console.log('✅ DI Container initialized successfully');
}

export function getDIContainer() {
  if (!isInitialized) {
    initializeDI();
  }
  return container;
}

export { container };

