import { ServletLogEntity } from '@/core/domain/entities/ServletLog';
import { ServletLogParserPort, ServletLogParseResult } from '@/core/domain/ports/ServletLogParserPort';

/**
 * Parser de LOGs Servlet de Payworks
 *
 * Formato esperado:
 * ********************************************************************************
 * [11/03/2026 18:02:25] SE RECIBIO POST HTTP DESDE LA IP: 99.80.99.245
 * CARD_NUMBER:        [510125******2396]
 * CMD_TRANS:          [AUTH]
 * CONTROL_NUMBER:     [140802786372026031200022522]
 * ...
 * ********************************************************************************
 *
 * [11/03/2026 18:02:26] SE ENVIO RESPUESTA HTTP HACIA LA IP: 99.80.99.245
 * RESULTADO_PAYW:     [A]
 * CODIGO_PAYW:        [000]
 * ...
 * ********************************************************************************
 */
export class PayworksServletLogParser implements ServletLogParserPort {
  private static readonly BLOCK_SEPARATOR = '********************************************************************************';
  private static readonly REQUEST_MARKER = 'SE RECIBIO POST HTTP';
  private static readonly RESPONSE_MARKER = 'SE ENVIO RESPUESTA HTTP';
  private static readonly TIMESTAMP_REGEX = /\[(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})\]/;
  private static readonly IP_REGEX = /(?:DESDE|HACIA)\s+LA\s+IP:\s*(\S+)/;
  private static readonly FIELD_REGEX = /^([A-Z_0-9]+)\s*:\s*\[([^\]]*)\]\s*$/;

  parseByControlNumber(logContent: string, controlNumber: string): ServletLogParseResult {
    const blocks = this.extractBlocks(logContent);

    let requestLog: ServletLogEntity | null = null;
    let responseLog: ServletLogEntity | null = null;

    for (const block of blocks) {
      const fields = this.parseFields(block);
      const hasControlNumber =
        fields.get('CONTROL_NUMBER') === controlNumber ||
        fields.get('NUMERO_CONTROL') === controlNumber;

      if (!hasControlNumber) continue;

      const headerLine = this.getHeaderLine(block);
      const timestamp = this.extractTimestamp(headerLine);
      const ip = this.extractIp(headerLine);

      if (headerLine.includes(PayworksServletLogParser.REQUEST_MARKER)) {
        requestLog = new ServletLogEntity(timestamp, 'REQUEST', ip, fields);
      } else if (headerLine.includes(PayworksServletLogParser.RESPONSE_MARKER)) {
        responseLog = new ServletLogEntity(timestamp, 'RESPONSE', ip, fields);
      }

      if (requestLog && responseLog) break;
    }

    if (!requestLog) {
      throw new Error(`No se encontro LOG Servlet de envio para CONTROL_NUMBER: ${controlNumber}`);
    }
    if (!responseLog) {
      throw new Error(`No se encontro LOG Servlet de respuesta para CONTROL_NUMBER: ${controlNumber}`);
    }

    return { request: requestLog, response: responseLog };
  }

  private extractBlocks(logContent: string): string[] {
    const separator = PayworksServletLogParser.BLOCK_SEPARATOR;
    const parts = logContent.split(separator);
    return parts.filter(part => part.trim().length > 0);
  }

  private getHeaderLine(block: string): string {
    const lines = block.trim().split('\n');
    for (const line of lines) {
      if (line.includes('SE RECIBIO') || line.includes('SE ENVIO')) {
        return line;
      }
    }
    return lines[0] || '';
  }

  private parseFields(block: string): Map<string, string> {
    const fields = new Map<string, string>();
    const lines = block.trim().split('\n');

    for (const line of lines) {
      const match = line.trim().match(PayworksServletLogParser.FIELD_REGEX);
      if (match) {
        fields.set(match[1], match[2]);
      }
    }

    return fields;
  }

  private extractTimestamp(headerLine: string): Date {
    const match = headerLine.match(PayworksServletLogParser.TIMESTAMP_REGEX);
    if (!match) return new Date();

    const [day, month, yearAndTime] = match[1].split('/');
    const [year, time] = yearAndTime.split(/\s+/);
    return new Date(`${year}-${month}-${day}T${time}`);
  }

  private extractIp(headerLine: string): string {
    const match = headerLine.match(PayworksServletLogParser.IP_REGEX);
    return match ? match[1] : '';
  }
}
