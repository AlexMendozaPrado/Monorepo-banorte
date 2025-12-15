import { DomainException } from './DomainException';

export class BusinessRuleException extends DomainException {
  constructor(message: string, public readonly rule?: string) {
    super(message);
  }
}
