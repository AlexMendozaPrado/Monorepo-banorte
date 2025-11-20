import { SentimentAnalyzerPort } from '../../core/domain/ports/SentimentAnalyzerPort';
import { OpenAISentimentAnalyzer } from './OpenAISentimentAnalyzer';
import { OllamaSentimentAnalyzer } from './OllamaSentimentAnalyzer';

export type AIProvider = 'openai' | 'ollama';

export interface SentimentAnalyzerConfig {
  provider: AIProvider;

  // OpenAI configuration
  openaiApiKey?: string;
  openaiModel?: string;

  // Ollama configuration
  ollamaBaseUrl?: string;
  ollamaModel?: string;

  // Common configuration
  maxTokens?: number;
  temperature?: number;
}

export class SentimentAnalyzerFactory {
  /**
   * Creates the appropriate sentiment analyzer based on the provided configuration
   * @param config Configuration for the sentiment analyzer
   * @returns A concrete implementation of SentimentAnalyzerPort
   * @throws Error if required configuration is missing
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
   * Validates that the configuration has all required fields for the specified provider
   * @param config Configuration to validate
   * @returns true if configuration is valid
   * @throws Error if configuration is invalid
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
