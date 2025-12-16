export interface OpenAIConfiguration {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
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
    };
    this.validate();
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

  private validate(): void {
    if (!this.config.apiKey) {
      console.warn('⚠️  OPENAI_API_KEY not set - AI features will use mock data');
    }
  }
}

