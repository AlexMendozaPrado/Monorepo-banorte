import { ServletLogEntity } from '../entities/ServletLog';

export interface ServletLogParseResult {
  request: ServletLogEntity;
  response: ServletLogEntity;
}

export interface ServletLogParserPort {
  parseByControlNumber(logContent: string, controlNumber: string): ServletLogParseResult;
}
