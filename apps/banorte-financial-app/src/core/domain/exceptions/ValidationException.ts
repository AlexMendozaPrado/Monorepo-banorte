import { DomainException } from './DomainException';

export class ValidationException extends DomainException {
  constructor(message: string, public readonly field?: string) {
    super(message);
  }
}
