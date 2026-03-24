import { SentimentAnalyzerPort } from '../../core/domain/ports/SentimentAnalyzerPort';
import { OpenAISentimentAnalyzer } from './OpenAISentimentAnalyzer';
import { OllamaSentimentAnalyzer } from './OllamaSentimentAnalyzer';

export type AIProvider = 'openai' | 'ollama';

export interface SentimentAnalyzerConfig {
  provider: AIProvider;

  // Configuración de OpenAI
  openaiApiKey?: string;
  openaiModel?: string;

  // Configuración de Ollama
  ollamaBaseUrl?: string;
  ollamaModel?: string;

  // Configuración común
  maxTokens?: number;
  temperature?: number;
}

export class SentimentAnalyzerFactory {
  /**
   * Crea el analizador de sentimientos apropiado basado en la configuración proporcionada
   * @param config Configuración para el analizador de sentimientos
   * @returns Una implementación concreta de SentimentAnalyzerPort
   * @throws Error si falta configuración requerida
   */
  static create(config: SentimentAnalyzerConfig): SentimentAnalyzerPort {
    switch (config.provider) {
      case 'openai':
        return this.createOpenAIAnalyzer(config);

      case 'ollama':
        return this.createOllamaAnalyzer(config);

      default:
        throw new Error(`Unknown AI provider: ${config.provider}`);
    }
  }

  private static createOpenAIAnalyzer(config: SentimentAnalyzerConfig): SentimentAnalyzerPort {
    if (!config.openaiApiKey) {
      throw new Error('OpenAI API key is required when provider is "openai"');
    }

    return new OpenAISentimentAnalyzer(
      config.openaiApiKey,
      config.openaiModel || 'gpt-4',
      config.maxTokens || 4000,
      config.temperature || 0.3
    );
  }

  private static createOllamaAnalyzer(config: SentimentAnalyzerConfig): SentimentAnalyzerPort {
    if (!config.ollamaBaseUrl) {
      throw new Error('Ollama base URL is required when provider is "ollama"');
    }

    if (!config.ollamaModel) {
      throw new Error('Ollama model is required when provider is "ollama"');
    }

    return new OllamaSentimentAnalyzer(
      config.ollamaBaseUrl,
      config.ollamaModel,
      config.maxTokens,
      config.temperature
    );
  }

  /**
   * Valida que la configuración tenga todos los campos requeridos para el proveedor especificado
   * @param config Configuración a validar
   * @returns true si la configuración es válida
   * @throws Error si la configuración es inválida
   */
  static validateConfig(config: SentimentAnalyzerConfig): boolean {
    if (!config.provider) {
      throw new Error('AI provider must be specified');
    }

    if (config.provider === 'openai' && !config.openaiApiKey) {
      throw new Error('OpenAI API key is required when provider is "openai"');
    }

    if (config.provider === 'ollama') {
      if (!config.ollamaBaseUrl) {
        throw new Error('Ollama base URL is required when provider is "ollama"');
      }
      if (!config.ollamaModel) {
        throw new Error('Ollama model is required when provider is "ollama"');
      }
    }

    return true;
  }
}
