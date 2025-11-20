import { DIContainerConfig } from '../infrastructure/di/DIContainer';
import { AIProvider } from '../infrastructure/sentiment/SentimentAnalyzerFactory';

/**
 * Gets the AI provider configuration from environment variables
 * @returns DIContainerConfig with all provider settings
 */
export function getAIProviderConfig(): DIContainerConfig {
  const aiProvider = (process.env.AI_PROVIDER as AIProvider) || 'openai';

  return {
    aiProvider,

    // OpenAI configuration
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.DEFAULT_MODEL || 'gpt-4',

    // Ollama configuration
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2',

    // Common configuration
    maxTokens: process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : undefined,
    temperature: process.env.TEMPERATURE ? parseFloat(process.env.TEMPERATURE) : undefined,
    maxFileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : undefined,
    maxExportLimit: process.env.MAX_EXPORT_LIMIT ? parseInt(process.env.MAX_EXPORT_LIMIT) : undefined,
  };
}

/**
 * Validates that the required configuration for the selected AI provider is present
 * @throws Error if required configuration is missing
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
