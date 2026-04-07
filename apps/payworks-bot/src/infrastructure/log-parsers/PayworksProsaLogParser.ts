import { ProsaLogEntity } from '@/core/domain/entities/ProsaLog';
import { ProsaLogParserPort, ProsaLogParseResult } from '@/core/domain/ports/ProsaLogParserPort';
import { ProsaMessagePair } from '@/core/domain/value-objects/TransactionType';

/**
 * Parser de LOGs PROSA (ISO 8583) de Payworks
 *
 * Formato esperado:
 * [11/03/2026 18:02:25] SE ENVIO MENSAJE HACIA EL AUTORIZADOR PROSA5 (/140.240.11.78:58701):
 * Campo 0: [0200]
 * Campo 2: [5101250000002396]
 * Campo 3: [000000]
 * Campo 4: [000000009839]
 * Campo 37: [320146914713]
 * ...
 *
 * [11/03/2026 18:02:26] SE RECIBIO MENSAJE DESDE EL AUTORIZADOR PROSA5 (/140.240.11.78:58701):
 * Campo 0: [0210]
 * Campo 37: [320146914713]
 * Campo 38: [830125]
 * Campo 39: [00]
 */
export class PayworksProsaLogParser implements ProsaLogParserPort {
  private static readonly REQUEST_MARKER = 'SE ENVIO MENSAJE HACIA EL AUTORIZADOR';
  private static readonly RESPONSE_MARKER = 'SE RECIBIO MENSAJE DESDE EL AUTORIZADOR';
  private static readonly TIMESTAMP_REGEX = /\[(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})\]/;
  private static readonly ADDRESS_REGEX = /\(\/?([\d.:]+)\)/;
  private static readonly CAMPO_REGEX = /^Campo\s+(\d+)\s*:\s*\[([^\]]*)\]\s*$/;

  parseByReferencia(logContent: string, referencia: string, messagePair: ProsaMessagePair): ProsaLogParseResult {
    const blocks = this.extractBlocks(logContent);

    let requestLog: ProsaLogEntity | null = null;
    let responseLog: ProsaLogEntity | null = null;

    for (const block of blocks) {
      const campos = this.parseCampos(block);
      const campo37 = campos.get(37);
      const campo0 = campos.get(0);

      if (campo37 !== referencia) continue;

      const headerLine = this.getHeaderLine(block);
      const timestamp = this.extractTimestamp(headerLine);
      const address = this.extractAddress(headerLine);

      if (campo0 === messagePair.request && headerLine.includes(PayworksProsaLogParser.REQUEST_MARKER)) {
        requestLog = new ProsaLogEntity(timestamp, 'REQUEST', campo0, address, campos);
      } else if (campo0 === messagePair.response && headerLine.includes(PayworksProsaLogParser.RESPONSE_MARKER)) {
        responseLog = new ProsaLogEntity(timestamp, 'RESPONSE', campo0, address, campos);
      }

      if (requestLog && responseLog) break;
    }

    if (!requestLog) {
      throw new Error(`No se encontro LOG PROSA de envio (${messagePair.request}) para REFERENCIA: ${referencia}`);
    }
    if (!responseLog) {
      throw new Error(`No se encontro LOG PROSA de respuesta (${messagePair.response}) para REFERENCIA: ${referencia}`);
    }

    return { request: requestLog, response: responseLog };
  }

  private extractBlocks(logContent: string): string[] {
    const lines = logContent.split('\n');
    const blocks: string[] = [];
    let currentBlock: string[] = [];

    for (const line of lines) {
      if (line.includes('SE ENVIO MENSAJE HACIA') || line.includes('SE RECIBIO MENSAJE DESDE')) {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock.join('\n'));
        }
        currentBlock = [line];
      } else if (currentBlock.length > 0 && line.trim().length > 0) {
        currentBlock.push(line);
      } else if (currentBlock.length > 0 && line.trim().length === 0) {
        blocks.push(currentBlock.join('\n'));
        currentBlock = [];
      }
    }

    if (currentBlock.length > 0) {
      blocks.push(currentBlock.join('\n'));
    }

    return blocks;
  }

  private getHeaderLine(block: string): string {
    const lines = block.trim().split('\n');
    return lines[0] || '';
  }

  private parseCampos(block: string): Map<number, string> {
    const campos = new Map<number, string>();
    const lines = block.trim().split('\n');

    for (const line of lines) {
      const match = line.trim().match(PayworksProsaLogParser.CAMPO_REGEX);
      if (match) {
        campos.set(parseInt(match[1], 10), match[2]);
      }
    }

    return campos;
  }

  private extractTimestamp(headerLine: string): Date {
    const match = headerLine.match(PayworksProsaLogParser.TIMESTAMP_REGEX);
    if (!match) return new Date();

    const [day, month, yearAndTime] = match[1].split('/');
    const [year, time] = yearAndTime.split(/\s+/);
    return new Date(`${year}-${month}-${day}T${time}`);
  }

  private extractAddress(headerLine: string): string {
    const match = headerLine.match(PayworksProsaLogParser.ADDRESS_REGEX);
    return match ? match[1] : '';
  }
}
