// Environment configuration and validation
export interface EnvironmentConfig {
  openaiApiKey: string;
  openaiModel: string;
  maxTokens: number;
  temperature: number;
  maxFileSize: number;
  maxExportLimit: number;
  isDevelopment: boolean;
  isProduction: boolean;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const config: EnvironmentConfig = {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.DEFAULT_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.MAX_TOKENS || '4000'),
    temperature: parseFloat(process.env.TEMPERATURE || '0.3'),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    maxExportLimit: parseInt(process.env.MAX_EXPORT_LIMIT || '10000'),
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  };

  // Validate required environment variables
  const requiredVars = ['openaiApiKey'];
  const missingVars = requiredVars.filter(key => !config[key as keyof EnvironmentConfig]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate numeric values
  if (config.maxTokens <= 0) {
    throw new Error('MAX_TOKENS must be a positive number');
  }

  if (config.temperature < 0 || config.temperature > 2) {
    throw new Error('TEMPERATURE must be between 0 and 2');
  }

  if (config.maxFileSize <= 0) {
    throw new Error('MAX_FILE_SIZE must be a positive number');
  }

  return config;
}

export function validateEnvironment(): boolean {
  try {
    getEnvironmentConfig();
    return true;
  } catch (error) {
    console.error('Environment validation failed:', error);
    return false;
  }
}
