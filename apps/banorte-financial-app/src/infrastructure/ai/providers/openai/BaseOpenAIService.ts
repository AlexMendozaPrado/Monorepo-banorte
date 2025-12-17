import OpenAI from 'openai';
import { OpenAIConfig } from './OpenAIConfig';
import { AIServiceException } from '@/core/domain/exceptions';

export interface OpenAICallOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json_object' | 'text';
}

export interface OpenAICallResult<T = any> {
  data: T;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export abstract class BaseOpenAIService {
  protected openai: OpenAI;
  protected config: ReturnType<OpenAIConfig['getConfig']>;

  constructor() {
    const configInstance = OpenAIConfig.getInstance();
    this.config = configInstance.getConfig();
    this.openai = new OpenAI({
      apiKey: this.config.apiKey,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries,
    });
  }

  /**
   * Método centralizado para hacer llamadas a OpenAI con manejo de errores
   */
  protected async callOpenAI<T>(options: OpenAICallOptions): Promise<OpenAICallResult<T>> {
    const startTime = Date.now();
    const {
      systemPrompt,
      userPrompt,
      temperature = this.config.temperature,
      maxTokens = this.config.maxTokens,
      responseFormat = 'json_object',
    } = options;

    try {
      this.logRequest(systemPrompt, userPrompt);

      const completionParams: OpenAI.Chat.ChatCompletionCreateParams = {
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      };

      // Agregar formato de respuesta solo si es compatible con el modelo
      if (responseFormat === 'json_object' && this.supportsJsonMode()) {
        completionParams.response_format = { type: 'json_object' };
      }

      const response = await this.openai.chat.completions.create(completionParams);

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new AIServiceException('Empty response from OpenAI', 'OpenAI');
      }

      const data = responseFormat === 'json_object'
        ? this.parseJSON<T>(content)
        : content as unknown as T;

      const duration = Date.now() - startTime;
      this.logResponse(data, response.usage, duration);

      return {
        data,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.logError(error, duration);
      throw this.handleOpenAIError(error);
    }
  }

  /**
   * Verifica si el modelo actual soporta JSON mode
   */
  private supportsJsonMode(): boolean {
    const jsonModeModels = [
      'gpt-4-1106-preview',
      'gpt-4-turbo-preview',
      'gpt-4-turbo',
      'gpt-4o',
      'gpt-4o-mini',
      'gpt-3.5-turbo-1106',
      'gpt-3.5-turbo-0125',
    ];

    return jsonModeModels.some(model => this.config.model.includes(model));
  }

  /**
   * Parse JSON con manejo de errores robusto
   */
  protected parseJSON<T>(content: string): T {
    try {
      // Intentar extraer JSON del contenido (en caso de que esté envuelto en texto)
      let jsonContent = content.trim();

      // Buscar objeto JSON en la respuesta
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }

      return JSON.parse(jsonContent) as T;
    } catch (error) {
      console.error('Failed to parse OpenAI JSON response:', content);
      throw new AIServiceException(
        'Invalid JSON response from OpenAI',
        'OpenAI',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Manejo de errores específico para OpenAI
   */
  protected handleOpenAIError(error: any): AIServiceException {
    // Rate limit errors
    if (error.status === 429) {
      return new AIServiceException(
        'OpenAI rate limit exceeded. Please try again later.',
        'OpenAI',
        error
      );
    }

    // Authentication errors
    if (error.status === 401) {
      return new AIServiceException(
        'Invalid OpenAI API key. Please check your configuration.',
        'OpenAI',
        error
      );
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return new AIServiceException(
        'OpenAI request timeout. Please try again.',
        'OpenAI',
        error
      );
    }

    // Generic error
    return new AIServiceException(
      error.message || 'OpenAI service error',
      'OpenAI',
      error
    );
  }

  /**
   * Logging estructurado para debugging
   */
  protected logRequest(systemPrompt: string, userPrompt: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('\n🤖 OpenAI Request:', {
        service: this.constructor.name,
        model: this.config.model,
        systemPromptLength: systemPrompt.length,
        userPromptLength: userPrompt.length,
        timestamp: new Date().toISOString(),
      });
    }
  }

  protected logResponse(data: any, usage: any, duration: number): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ OpenAI Response:', {
        service: this.constructor.name,
        tokensUsed: usage?.total_tokens,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  protected logError(error: any, duration: number): void {
    console.error('❌ OpenAI Error:', {
      service: this.constructor.name,
      error: error.message,
      status: error.status,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  }
}
