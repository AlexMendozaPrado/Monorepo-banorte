import { CybersourceLogEntity } from '../entities/CybersourceLog';

export interface CybersourceLogParseResult {
  request: CybersourceLogEntity;
  response: CybersourceLogEntity;
}

export interface CybersourceLogParserPort {
  /**
   * Parse a Cybersource log and return the request + response blocks
   * matching the given `OrderId` (a.k.a. MerchantReferenceCode).
   *
   * Throws if either block cannot be located.
   */
  parseByOrderId(logContent: string, orderId: string): CybersourceLogParseResult;
}
