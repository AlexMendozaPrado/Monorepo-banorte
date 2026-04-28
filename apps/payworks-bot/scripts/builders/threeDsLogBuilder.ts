export interface ThreeDsBlock {
  kind: 'request' | 'response';
  timestamp: string;     // 'YYYY/MM/DD HH:MM:SS' (formato real del log del equipo)
  folio: string;
  fields: Record<string, string>;
}

const SEPARATOR = '*'.repeat(80);
const FIELD_KEY_WIDTH = 26; // padding observado en log real ("MerchantId:               [")

/**
 * Genera contenido compatible con `ThreeDSLogParser.parseByFolio()`.
 *
 * El parser busca el bloque por valor de `FOLIO DE TRANSACCION`, `Reference3D`,
 * `Folio` o `FolioTransaccion`. Para que funcione, el folio debe aparecer como
 * un campo `KEY: [VALUE]` (no solo en el header). Por eso emitimos
 * `Reference3D: [<folio>]` dentro del bloque.
 *
 * Nota: el header del log real tiene `RECIBIENDO PETICION DE COMERCIO,
 * FOLIO DE TRANSACCION: <folio>` (sin corchetes) — eso queda como contexto
 * pero el matching se hace por `Reference3D`.
 */
export function buildThreeDsLog(blocks: ThreeDsBlock[]): string {
  const out: string[] = [];

  for (const block of blocks) {
    out.push(SEPARATOR);

    if (block.kind === 'request') {
      out.push(`[${block.timestamp}] RECIBIENDO PETICION DE COMERCIO, FOLIO DE TRANSACCION: ${block.folio}`);
    } else {
      out.push(`[${block.timestamp}] ENVIANDO RESPUESTA A COMERCIO, FOLIO DE TRANSACCION: ${block.folio}`);
      out.push('**********TRANSACCION CERTIFICADA**********');
    }

    const fields: Record<string, string> = { ...block.fields };
    if (!fields.Reference3D) {
      fields.Reference3D = block.folio;
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
