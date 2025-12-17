/**
 * Error en respuesta
 */
export interface ResponseError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * DTO genérico para respuestas
 */
export interface ResponseDTO<T> {
  success: boolean;
  data?: T;
  error?: ResponseError;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Builder para crear ResponseDTOs
 */
export class ResponseDTOBuilder {
  /**
   * Crea una respuesta exitosa
   */
  static success<T>(data: T): ResponseDTO<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Crea una respuesta de error
   */
  static error<T = never>(
    message: string,
    code: string = 'ERROR',
    details?: Record<string, unknown>
  ): ResponseDTO<T> {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Crea una respuesta de error desde una excepción
   */
  static fromException<T = never>(error: Error, code: string = 'ERROR'): ResponseDTO<T> {
    return {
      success: false,
      error: {
        code,
        message: error.message,
        details: {
          name: error.name,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
