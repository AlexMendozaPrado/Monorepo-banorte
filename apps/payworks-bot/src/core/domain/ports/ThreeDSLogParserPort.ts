import { ThreeDSLogEntity } from '../entities/ThreeDSLog';

export interface ThreeDSLogParserPort {
  /**
   * Parse a 3DS log and return the block matching the given folio
   * (`FOLIO DE TRANSACCION` or `Reference3D`). Throws if not found.
   */
  parseByFolio(logContent: string, folio: string): ThreeDSLogEntity;
}
