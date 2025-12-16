export interface OpenAIConfiguration {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

export class OpenAIConfig {
  private static instance: OpenAIConfig;
  private config: OpenAIConfiguration;

  private constructor() {
    this.config = {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.3'),
      timeout: parseInt(process.env.OPENAI_TIMEOUT || '60000'),
      maxRetries: parseInt(process.env.OPENAI_MAX_RETRIES || '3'),
      retryDelay: parseInt(process.env.OPENAI_RETRY_DELAY || '1000'),
    };
    this.validateStrict();
  }

  static getInstance(): OpenAIConfig {
    if (!OpenAIConfig.instance) {
      OpenAIConfig.instance = new OpenAIConfig();
    }
    return OpenAIConfig.instance;
  }

  getConfig(): OpenAIConfiguration {
    return { ...this.config };
  }

  private validateStrict(): void {
    if (!this.config.apiKey) {
      throw new Error(
        '❌ OPENAI_API_KEY is required. Set it in .env file.\n' +
        'Get your key at: https://platform.openai.com/api-keys'
      );
    }

    if (!this.config.apiKey.startsWith('sk-')) {
      throw new Error('❌ Invalid OPENAI_API_KEY format. Key must start with "sk-"');
    }

    console.log('✅ OpenAI configuration validated');
  }

  async verifyConnection(): Promise<boolean> {
    try {
      const openai = new (await import('openai')).default({ apiKey: this.config.apiKey });
      await openai.models.retrieve('gpt-4o-mini');
      console.log('✅ OpenAI connection verified');
      return true;
    } catch (error: any) {
      console.error('❌ OpenAI connection failed:', error.message);
      throw new Error(`OpenAI verification failed: ${error.message}`);
    }
  }
}

