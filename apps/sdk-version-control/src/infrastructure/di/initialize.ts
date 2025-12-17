import { container, DIContainer } from './container';
import { registerSDKModule } from './modules/sdkModule';

let isInitialized = false;

/**
 * Inicializa el contenedor de dependencias
 */
export function initializeDI(): void {
  if (isInitialized) {
    console.log('[DI] Container already initialized');
    return;
  }

  console.log('[DI] Initializing container...');

  try {
    // Registrar módulos
    registerSDKModule(container);

    // Validar servicios críticos
    container.validate([
      'IServiceRepository',
      'IVersionCheckerPort',
      'GetAllServicesUseCase',
      'CheckVersionUpdatesUseCase',
      'CompareServicesUseCase',
    ]);

    isInitialized = true;
    console.log('[DI] Container initialized successfully');
  } catch (error) {
    console.error('[DI] Failed to initialize container:', error);
    throw error;
  }
}

/**
 * Obtiene el contenedor de dependencias
 * Inicializa automáticamente si no está inicializado
 */
export function getDIContainer(): DIContainer {
  if (!isInitialized) {
    initializeDI();
  }
  return container;
}

/**
 * Reinicia el contenedor (útil para testing)
 */
export function resetDI(): void {
  container.clear();
  isInitialized = false;
  console.log('[DI] Container reset');
}

/**
 * Verifica si el contenedor está inicializado
 */
export function isDIInitialized(): boolean {
  return isInitialized;
}
