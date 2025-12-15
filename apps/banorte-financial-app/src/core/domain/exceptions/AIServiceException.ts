import { DomainException } from './DomainException';

export class AIServiceException extends DomainException {
  constructor(
    message: string,
    public readonly provider?: string,
    public readonly originalError?: Error
  ) {
    super(message);
  }
}
