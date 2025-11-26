import { SessionAnalysisPort } from '../../core/domain/ports/SessionAnalysisPort';
import { OpenAISessionAnalyzer } from './OpenAISessionAnalyzer';

export type SessionAnalyzerProvider = 'openai' | 'ollama';

export interface SessionAnalyzerConfig {
  provider: SessionAnalyzerProvider;

  // OpenAI configuration
  openaiApiKey?: string;
  openaiModel?: string;

  // Ollama configuration (for future implementation)
  ollamaBaseUrl?: string;
  ollamaModel?: string;

  // Common configuration
  maxTokens?: number;
  temperature?: number;
}

/**
 * Factory para crear instancias de SessionAnalysisPort
 *
 * Soporta múltiples providers (OpenAI, Ollama, etc.)
 * con configuración flexible y validación.
 */
export class SessionAnalyzerFactory {
  /**
   * Crea el analizador de sesiones apropiado basado en la configuración
   *
   * @param config Configuración del analizador
   * @returns Implementación concreta de SessionAnalysisPort
   * @throws Error si falta configuración requerida o provider desconocido
   *
   * @example
   * ```typescript
   * const analyzer = SessionAnalyzerFactory.create({
   *   provider: 'openai',
   *   openaiApiKey: process.env.OPENAI_API_KEY,
   *   openaiModel: 'gpt-4o',
   *   maxTokens: 16000,
   *   temperature: 0.3
   * });
   * ```
   */
  static create(config: SessionAnalyzerConfig): SessionAnalysisPort {
    this.validateConfig(config);

    switch (config.provider) {
      case 'openai':
        return this.createOpenAIAnalyzer(config);

      case 'ollama':
        return this.createOllamaAnalyzer(config);

      default:
        throw new Error(`Unknown session analyzer provider: ${config.provider}`);
    }
  }

  /**
   * Crea el analizador de sesiones desde variables de entorno
   *
   * Variables de entorno esperadas:
   * - SESSION_ANALYZER_PROVIDER: 'openai' | 'ollama'
   * - OPENAI_API_KEY: API key de OpenAI (si provider=openai)
   * - OPENAI_MODEL: Modelo a usar (opcional, default: gpt-4o)
   * - OLLAMA_BASE_URL: URL base de Ollama (si provider=ollama)
   * - OLLAMA_MODEL: Modelo de Ollama (si provider=ollama)
   * - SESSION_ANALYZER_MAX_TOKENS: Tokens máximos (opcional)
   * - SESSION_ANALYZER_TEMPERATURE: Temperature (opcional)
   *
   * @returns Implementación concreta de SessionAnalysisPort
   * @throws Error si falta configuración requerida
   */
  static createFromEnv(): SessionAnalysisPort {
    const provider = (process.env.SESSION_ANALYZER_PROVIDER || 'openai') as SessionAnalyzerProvider;

    const config: SessionAnalyzerConfig = {
      provider,
      openaiApiKey: process.env.OPENAI_API_KEY,
      openaiModel: process.env.OPENAI_MODEL || 'gpt-4o',
      ollamaBaseUrl: process.env.OLLAMA_BASE_URL,
      ollamaModel: process.env.OLLAMA_MODEL,
      maxTokens: process.env.SESSION_ANALYZER_MAX_TOKENS
        ? parseInt(process.env.SESSION_ANALYZER_MAX_TOKENS, 10)
        : undefined,
      temperature: process.env.SESSION_ANALYZER_TEMPERATURE
        ? parseFloat(process.env.SESSION_ANALYZER_TEMPERATURE)
        : undefined,
    };

    return this.create(config);
  }

  private static createOpenAIAnalyzer(config: SessionAnalyzerConfig): SessionAnalysisPort {
    if (!config.openaiApiKey) {
      throw new Error('OpenAI API key is required when provider is "openai"');
    }

    return new OpenAISessionAnalyzer(
      config.openaiApiKey,
      config.openaiModel || 'gpt-4o',
      config.maxTokens || 16000,
      config.temperature || 0.3
    );
  }

  private static createOllamaAnalyzer(config: SessionAnalyzerConfig): SessionAnalysisPort {
    if (!config.ollamaBaseUrl) {
      throw new Error('Ollama base URL is required when provider is "ollama"');
    }

    if (!config.ollamaModel) {
      throw new Error('Ollama model is required when provider is "ollama"');
    }

    // TODO: Implementar OllamaSessionAnalyzer
    throw new Error('Ollama session analyzer not yet implemented');
  }

  /**
   * Valida que la configuración tenga todos los campos requeridos
   *
   * @param config Configuración a validar
   * @returns true si la configuración es válida
   * @throws Error si la configuración es inválida
   */
  static validateConfig(config: SessionAnalyzerConfig): boolean {
    if (!config.provider) {
      throw new Error('Session analyzer provider must be specified');
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

    if (config.maxTokens !== undefined && config.maxTokens < 1000) {
      throw new Error('maxTokens must be at least 1000 for session analysis');
    }

    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
      throw new Error('temperature must be between 0 and 2');
    }

    return true;
  }
}
