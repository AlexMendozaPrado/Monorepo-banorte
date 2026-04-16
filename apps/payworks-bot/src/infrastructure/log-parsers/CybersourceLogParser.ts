import { CybersourceLogEntity } from '@/core/domain/entities/CybersourceLog';
import {
  CybersourceLogParseResult,
  CybersourceLogParserPort,
} from '@/core/domain/ports/CybersourceLogParserPort';

/**
 * Parser para logs de Cybersource Direct (capa anti-fraude, v1.10).
 *
 * Formato esperado (ejemplo real del equipo Payworks):
 *
 *   [2026-03-11 18:02:25] [INFO] ==== VARIABLES EN ENVÍO ====
 *   [INFO] OrderId: ORD12345
 *   [INFO] BillTo_firstName: Juan
 *   [INFO] BillTo_lastName: Perez
 *   [INFO] Card_accountNumber: 4111111111111111
 *   [INFO] ...
 *   [2026-03-11 18:02:27] [INFO] ==== VARIABLES DE RETORNO ====
 *   [INFO] decision: ACCEPT
 *   [INFO] OrderId: ORD12345
 *   [INFO] Bnte_code: 00
 *   ...
 *
 * Identificador del bloque: `OrderId` (también llamado
 * `MerchantReferenceCode` en la spec de Cybersource).
 */
export class CybersourceLogParser implements CybersourceLogParserPort {
  /**
   * Block-header markers. Matched only against lines that look like a
   * section header (no `name: value` pair) to avoid false positives on
   * field names that happen to contain the word REQUEST/RESPONSE (e.g.
   * `requestID`).
   */
  private static readonly REQUEST_HEADER_REGEX =
    /VARIABLES\s+EN\s+ENV[IÍ]O|==\s*REQUEST\s*==/i;
  private static readonly RESPONSE_HEADER_REGEX =
    /VARIABLES\s+DE\s+RETORNO|==\s*RESPONSE\s*==/i;
  private static readonly TIMESTAMP_REGEX =
    /\[(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2})\]/;
  /**
   * Matches lines like `[INFO] BillTo_firstName: Juan` — the level prefix is
   * optional so we also accept bare `BillTo_firstName: Juan`.
   */
  private static readonly FIELD_REGEX =
    /^(?:\[(?:INFO|WARN|ERROR|DEBUG)\]\s*)?([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*?)\s*$/;

  parseByOrderId(logContent: string, orderId: string): CybersourceLogParseResult {
    const blocks = this.splitBlocks(logContent);

    let request: CybersourceLogEntity | null = null;
    let response: CybersourceLogEntity | null = null;

    for (const block of blocks) {
      const fields = this.parseFields(block.body);
      const blockOrderId =
        fields.get('OrderId') ?? fields.get('MerchantReferenceCode');
      if (blockOrderId !== orderId) continue;

      const timestamp = this.extractTimestamp(block.body) ?? new Date();

      if (block.kind === 'REQUEST' && !request) {
        request = new CybersourceLogEntity(timestamp, 'REQUEST', fields);
      } else if (block.kind === 'RESPONSE' && !response) {
        response = new CybersourceLogEntity(timestamp, 'RESPONSE', fields);
      }
      if (request && response) break;
    }

    if (!request) {
      throw new Error(
        `No se encontró bloque Cybersource de envío para OrderId: ${orderId}`,
      );
    }
    if (!response) {
      throw new Error(
        `No se encontró bloque Cybersource de respuesta para OrderId: ${orderId}`,
      );
    }

    return { request, response };
  }

  private splitBlocks(
    content: string,
  ): Array<{ kind: 'REQUEST' | 'RESPONSE'; body: string }> {
    const lines = content.split(/\r?\n/);
    const blocks: Array<{ kind: 'REQUEST' | 'RESPONSE'; body: string }> = [];

    let current: { kind: 'REQUEST' | 'RESPONSE'; lines: string[] } | null = null;

    for (const line of lines) {
      const isRequest = CybersourceLogParser.REQUEST_HEADER_REGEX.test(line);
      const isResponse =
        !isRequest && CybersourceLogParser.RESPONSE_HEADER_REGEX.test(line);

      if (isRequest || isResponse) {
        if (current) blocks.push({ kind: current.kind, body: current.lines.join('\n') });
        current = { kind: isRequest ? 'REQUEST' : 'RESPONSE', lines: [line] };
      } else if (current) {
        current.lines.push(line);
      }
    }
    if (current) blocks.push({ kind: current.kind, body: current.lines.join('\n') });

    return blocks;
  }

  private parseFields(blockBody: string): Map<string, string> {
    const fields = new Map<string, string>();
    for (const raw of blockBody.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line) continue;
      // Skip header markers themselves
      if (/VARIABLES (EN ENV[IÍ]O|DE RETORNO)/i.test(line)) continue;
      const match = line.match(CybersourceLogParser.FIELD_REGEX);
      if (!match) continue;
      const [, name, value] = match;
      // Preserve the first occurrence — Cybersource repeats OrderId in both blocks
      if (!fields.has(name)) fields.set(name, value);
    }
    return fields;
  }

  private extractTimestamp(block: string): Date | null {
    const match = block.match(CybersourceLogParser.TIMESTAMP_REGEX);
    if (!match) return null;
    const normalized = match[1].replace(' ', 'T');
    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
  }
}
