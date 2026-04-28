export interface ServletBlock {
  kind: 'request' | 'response';
  controlNumber: string;
  timestamp: string;     // 'DD/MM/YYYY HH:MM:SS'
  ip: string;
  contextHeader?: string; // ej. 'VENTA LOG DE ENTRADA'
  fields: Record<string, string>;
}

const SEPARATOR = '*'.repeat(80);
const FIELD_KEY_WIDTH = 22; // padding observado en logs reales (ej. "CARD_NUMBER:          ")

/**
 * Genera contenido compatible con `PayworksServletLogParser`.
 *
 * Replica formato real:
 *   - Bloques separados por linea de 80 asteriscos
 *   - Encabezado contextual opcional sobre el bloque
 *   - Header con marker `SE RECIBIO POST HTTP` o `SE ENVIO RESPUESTA HTTP` y `DESDE/HACIA LA IP:`
 *   - Campos `KEY:<padding>[VALUE]` con padding fijo en la columna del valor
 */
export function buildServletLog(blocks: ServletBlock[]): string {
  const out: string[] = [];

  for (const block of blocks) {
    if (block.contextHeader) {
      out.push(block.contextHeader);
    }
    out.push(SEPARATOR);

    const marker = block.kind === 'request' ? 'SE RECIBIO POST HTTP DESDE' : 'SE ENVIO RESPUESTA HTTP HACIA';
    out.push(`[${block.timestamp}] ${marker} LA IP:  ${block.ip}`);

    // Garantizar que CONTROL_NUMBER siempre exista (parser lo necesita para localizar el bloque)
    const fields: Record<string, string> = { ...block.fields };
    if (!fields.CONTROL_NUMBER) {
      fields.CONTROL_NUMBER = block.controlNumber;
    }

    for (const [key, value] of Object.entries(fields)) {
      const paddedKey = `${key}:`.padEnd(FIELD_KEY_WIDTH, ' ');
      out.push(`${paddedKey}[${value}]`);
    }

    out.push(SEPARATOR);
    out.push('');
  }

  return out.join('\n');
}
