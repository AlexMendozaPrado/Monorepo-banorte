import { PaginationDTO } from './PaginationDTO';

export interface ResponseDTO<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    field?: string;
  };
  pagination?: PaginationDTO;
  metadata?: Record<string, unknown>;
}

export class ResponseDTOBuilder {
  static success<T>(data: T, metadata?: Record<string, unknown>): ResponseDTO<T> {
    return {
      success: true,
      data,
      metadata,
    };
  }

  static successWithPagination<T>(
    data: T,
    pagination: PaginationDTO,
    metadata?: Record<string, unknown>
  ): ResponseDTO<T> {
    return {
      success: true,
      data,
      pagination,
      metadata,
    };
  }

  static error<T>(
    message: string,
    code?: string,
    field?: string
  ): ResponseDTO<T> {
    return {
      success: false,
      error: {
        message,
        code,
        field,
      },
    };
  }
}
