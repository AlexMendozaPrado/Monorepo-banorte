import { DIContainerConfig } from '../infrastructure/di/DIContainer';
import { AIProvider } from '../infrastructure/sentiment/SentimentAnalyzerFactory';

/**
 * Obtiene la configuración del proveedor de IA desde variables de entorno
 * @returns DIContainerConfig con todas las configuraciones del proveedor
 */
export function getAIProviderConfig(): DIContainerConfig {
  const aiProvider = (process.env.AI_PROVIDER as AIProvider) || 'openai';

  return {
    aiProvider,

    // Configuración de OpenAI
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.DEFAULT_MODEL || 'gpt-4',

    // Configuración de Ollama
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2',

    // Configuración común
    maxTokens: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : undefined,
    temperature: process.env.TEMPERATURE ? parseFloat(process.env.TEMPERATURE) : undefined,
    maxFileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : undefined,
    maxExportLimit: process.env.MAX_EXPORT_LIMIT ? parseInt(process.env.MAX_EXPORT_LIMIT) : undefined,
  };
}

/**
 * Valida que la configuración requerida para el proveedor de IA seleccionado esté presente
 * @throws Error si falta configuración requerida
 */
export function validateAIProviderConfig(): void {
  const aiProvider = (process.env.AI_PROVIDER as AIProvider) || 'openai';

  if (aiProvider === 'openai') {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required when AI_PROVIDER is "openai"');
    }
  } else if (aiProvider === 'ollama') {
    if (!process.env.OLLAMA_BASE_URL) {
      throw new Error('OLLAMA_BASE_URL environment variable is required when AI_PROVIDER is "ollama"');
    }
    if (!process.env.OLLAMA_MODEL) {
      throw new Error('OLLAMA_MODEL environment variable is required when AI_PROVIDER is "ollama"');
    }
  }
}
