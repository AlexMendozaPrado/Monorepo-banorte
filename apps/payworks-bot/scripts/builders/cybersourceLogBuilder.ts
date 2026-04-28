export interface CybersourceBlock {
  kind: 'request' | 'response';
  timestamp: string;     // 'DD/MM/YYYY HH:MM' (formato del log real del equipo)
  fields: Record<string, string>;
}

/**
 * Genera contenido compatible con `CybersourceLogParser.parseByOrderId()`.
 *
 * Replica formato real del log del equipo:
 *   - Cada linea con prefijo `[INFO]` o `[WARN]`
 *   - Bloque envuelto en lineas de asteriscos `[INFO] *********`
 *   - Header `[INFO] **** VARIABLES EN ENVIO ****` o `[INFO] **** VARIABLES DE RETORNO ****`
 *   - Linea `[INFO] Fecha y hora Servidor: <timestamp>` (sin corchetes adicionales)
 *   - Campos en formato `[INFO] key: value` o `[WARN] key: value`
 *   - El parser identifica el bloque por `OrderId` o `MerchantReferenceCode`
 */
export function buildCybersourceLog(blocks: CybersourceBlock[]): string {
  const out: string[] = [];
  const STAR_LINE = '[INFO] *************************************************';

  for (const block of blocks) {
    out.push(STAR_LINE);
    if (block.kind === 'request') {
      out.push('[INFO] ************** VARIABLES EN ENVIO ***************');
    } else {
      out.push('[INFO] ************* VARIABLES DE RETORNO **************');
    }
    out.push(STAR_LINE);
    out.push(`[INFO] Fecha y hora Servidor: ${block.timestamp}`);

    const levelPrefix = block.kind === 'request' ? '[WARN]' : '[INFO]';
    for (const [key, value] of Object.entries(block.fields)) {
      out.push(`${levelPrefix} ${key}: ${value}`);
    }

    out.push(STAR_LINE);
    out.push('');
  }

  return out.join('\n');
}
