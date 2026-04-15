import { ThreeDSLogEntity } from '@/core/domain/entities/ThreeDSLog';
import { ThreeDSLogParserPort } from '@/core/domain/ports/ThreeDSLogParserPort';

/**
 * Parser para LOGs del servicio 3D Secure 2 (capa transversal v1.4).
 *
 * Formato esperado — mismo bloque/separador que Payworks servlet, pero
 * los campos son una mezcla español/inglés y el bloque se identifica
 * por `FOLIO DE TRANSACCION` o `Reference3D`:
 *
 *   ********************************************************************************
 *   [11/03/2026 18:02:25] SE RECIBIO SOLICITUD 3DS
 *   FOLIO DE TRANSACCION: [9905419_140426_XXX]
 *   Card:                 [41891431******56]
 *   Total:                [1500.00]
 *   CardType:             [VISA]
 *   MerchantId:           [7004145530]
 *   MerchantName:         [MUEVE CIUDAD]
 *   MerchantCity:         [GUADALAJARA]
 *   Cert3D:               [03]
 *   ECI:                  [05]
 *   XID:                  [... 40 hex chars ...]
 *   CAVV:                 [... 40 hex chars ...]
 *   Version3D:            [2]
 *   Reference3D:          [9905419_140426_XXX]
 *   Status:               [200]
 *   ********************************************************************************
 */
export class ThreeDSLogParser implements ThreeDSLogParserPort {
  private static readonly BLOCK_SEPARATOR = '*'.repeat(80);
  private static readonly TIMESTAMP_REGEX =
    /\[(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})\]/;
  /** Fields in 3DS logs mix `Nombre:` (español) and `MerchantId:` (inglés). */
  private static readonly FIELD_REGEX =
    /^([A-Za-z][A-Za-z0-9_]*(?:\s+[A-Za-z0-9_]+)*)\s*:\s*\[([^\]]*)\]\s*$/;

  parseByFolio(logContent: string, folio: string): ThreeDSLogEntity {
    const blocks = this.splitBlocks(logContent);

    for (const block of blocks) {
      const fields = this.parseFields(block);
      const blockFolio =
        fields.get('FOLIO DE TRANSACCION') ??
        fields.get('Reference3D') ??
        fields.get('Folio') ??
        fields.get('FolioTransaccion');
      if (blockFolio !== folio) continue;

      const timestamp = this.extractTimestamp(block) ?? new Date();
      return new ThreeDSLogEntity(timestamp, folio, fields);
    }

    throw new Error(`No se encontró bloque 3DS para folio: ${folio}`);
  }

  private splitBlocks(content: string): string[] {
    return content
      .split(ThreeDSLogParser.BLOCK_SEPARATOR)
      .map(b => b.trim())
      .filter(b => b.length > 0);
  }

  private parseFields(block: string): Map<string, string> {
    const fields = new Map<string, string>();
    for (const raw of block.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) continue;
      const match = line.match(ThreeDSLogParser.FIELD_REGEX);
      if (!match) continue;
      const [, name, value] = match;
      fields.set(name.trim(), value);
    }
    return fields;
  }

  private extractTimestamp(block: string): Date | null {
    const match = block.match(ThreeDSLogParser.TIMESTAMP_REGEX);
    if (!match) return null;
    const [day, month, yearAndTime] = match[1].split('/');
    const [year, time] = yearAndTime.split(/\s+/);
    const iso = `${year}-${month}-${day}T${time}`;
    const date = new Date(iso);
    return isNaN(date.getTime()) ? null : date;
  }
}
