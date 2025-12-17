import { DomainException } from './DomainException';

export enum AIErrorCode {
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TIMEOUT = 'TIMEOUT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  UNKNOWN = 'UNKNOWN',
}

export class AIServiceException extends DomainException {
  constructor(
    message: string,
    public readonly provider?: string,
    public readonly originalError?: Error,
    public readonly errorCode: AIErrorCode = AIErrorCode.UNKNOWN,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIServiceException';
  }

  static fromOpenAIError(error: any): AIServiceException {
    if (error.status === 401) {
      return new AIServiceException(
        'Invalid OpenAI API key',
        'OpenAI',
        error,
        AIErrorCode.AUTHENTICATION_FAILED,
        false
      );
    }

    if (error.status === 429) {
      return new AIServiceException(
        'OpenAI rate limit exceeded',
        'OpenAI',
        error,
        AIErrorCode.RATE_LIMIT_EXCEEDED,
        true // Retryable
      );
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return new AIServiceException(
        'OpenAI request timeout',
        'OpenAI',
        error,
        AIErrorCode.TIMEOUT,
        true // Retryable
      );
    }

    return new AIServiceException(
      error.message || 'Unknown OpenAI error',
      'OpenAI',
      error,
      AIErrorCode.UNKNOWN,
      false
    );
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      provider: this.provider,
      errorCode: this.errorCode,
      retryable: this.retryable,
      timestamp: new Date().toISOString(),
    };
  }
}
