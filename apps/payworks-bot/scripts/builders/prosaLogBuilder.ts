export interface ProsaBlock {
  kind: 'request' | 'response';
  timestamp: string;          // 'DD/MM/YYYY HH:MM:SS'
  prosaInstance: string;      // 'PROSA1' | 'PROSA3' | 'PROSA5' | 'PROSA6'
  authAddress: string;        // ej. '/192.168.245.78:53189' (sin paréntesis)
  sendIp?: string;            // ej. '/192.168.148.40:43189' (solo en request)
  contextHeader?: string;     // ej. 'PROSA' o 'VENTA LOG DE ENVIO A PROSA'
  /** Campos numerados ISO 8583. Las claves son numero -> valor crudo (preservar padding del original). */
  campos: Record<number, string>;
}

const SEPARATOR = '*'.repeat(80);

/**
 * Genera contenido compatible con `PayworksProsaLogParser`.
 *
 * Replica formato real:
 *   - Header con doble espacio antes de PROSA<N>
 *   - Linea adicional `IP DE ENVIO : (/IP:PORT)` solo en request
 *   - Campos con padding (numero alineado a derecha en 3 chars)
 *   - Campo 37 (REFERENCIA) requerido para que el parser localice el bloque
 */
export function buildProsaLog(blocks: ProsaBlock[]): string {
  const out: string[] = [];

  for (const block of blocks) {
    if (block.contextHeader) {
      out.push(block.contextHeader);
    }
    out.push(SEPARATOR);

    const marker = block.kind === 'request'
      ? 'SE ENVIO MENSAJE HACIA EL AUTORIZADOR'
      : 'SE RECIBIO MENSAJE DESDE EL AUTORIZADOR';
    out.push(`[${block.timestamp}] ${marker}  ${block.prosaInstance} (${block.authAddress}):`);

    if (block.kind === 'request' && block.sendIp) {
      out.push(`IP DE ENVIO : (${block.sendIp})`);
    }

    const sortedKeys = Object.keys(block.campos)
      .map((k) => Number(k))
      .sort((a, b) => a - b);

    for (const num of sortedKeys) {
      const padded = String(num).padStart(3, ' ');
      out.push(`Campo ${padded}: [${block.campos[num]}]`);
    }

    // NUMERO_BIN suele aparecer al final fuera del esquema "Campo N" pero los logs
    // reales lo emiten — replicamos como linea libre cuando viene en campos[-1].
    // Por simplicidad lo omitimos (no afecta al parser).

    out.push(SEPARATOR);
    out.push('');
  }

  return out.join('\n');
}
