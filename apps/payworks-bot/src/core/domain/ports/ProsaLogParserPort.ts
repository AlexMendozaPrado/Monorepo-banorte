import { ProsaLogEntity } from '../entities/ProsaLog';
import { ProsaMessagePair } from '../value-objects/TransactionType';

export interface ProsaLogParseResult {
  request: ProsaLogEntity;
  response: ProsaLogEntity;
}

export interface ProsaLogParserPort {
  parseByReferencia(logContent: string, referencia: string, messagePair: ProsaMessagePair): ProsaLogParseResult;
}
