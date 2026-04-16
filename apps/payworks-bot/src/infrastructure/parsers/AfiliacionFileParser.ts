import { AfiliacionEntity } from '@/core/domain/entities/Afiliacion';

/**
 * Flexible mapping of column-name aliases → canonical field on AfiliacionEntity.
 * Matching is case-insensitive and ignores accents/spaces/underscores.
 */
const COLUMN_ALIASES: Record<string, string[]> = {
  idAfiliacion: ['ID_AFILIACION', 'AFILIACION', 'ID AFILIACION', 'MERCHANT_ID'],
  nombreComercio: ['NOMBRE_COMERCIO', 'NOMBRE COMERCIO', 'NOMBRE', 'MERCHANT_NAME'],
  razonSocial: ['RAZON_SOCIAL', 'RAZON SOCIAL', 'RAZONSOCIAL'],
  rfc: ['RFC'],
  numeroCliente: ['NUMERO_CLIENTE', 'NUMERO CLIENTE', 'ID_CLIENTE', 'NUMCLIENTE'],
  giro: ['GIRO'],
  mccDescripcion: ['MCC_DESCRIPCION', 'MCC', 'GIRO_MCC'],
  esquema: ['ESQUEMA'],
  tipoIntegracion: ['TIPO_INTEGRACION', 'TIPO INTEGRACION', 'INTEGRATION_TYPE'],
  direccion: ['DIRECCION', 'DOMICILIO'],
  ciudad: ['CIUDAD'],
  estado: ['ESTADO'],
  codigoPostal: ['CP', 'CODIGO_POSTAL', 'CODIGO POSTAL', 'ZIP', 'ZIP_CODE'],
  email: ['EMAIL', 'CORREO', 'CORREO_ELECTRONICO'],
  telefono: ['TELEFONO', 'TEL', 'PHONE'],
  usuario: ['USUARIO', 'USER'],
  status: ['STATUS', 'ESTATUS'],
};

function normalize(header: string): string {
  return header
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_]+/g, '')
    .toUpperCase()
    .trim();
}

/**
 * Parser that accepts either a CSV (comma/semicolon) or a TXT (pipe-separated)
 * export of `SELECT * FROM NPAYW.AFILIACIONES` and returns a flat list of
 * `AfiliacionEntity`.
 *
 * The parser is tolerant:
 * - Separator is auto-detected (`,` vs `;` vs `|`).
 * - Encoding is assumed UTF-8; if the buffer is Latin-1 it's re-decoded.
 * - Header names can vary in language (see `COLUMN_ALIASES`).
 * - Columns not present in the alias map are captured under `extras`.
 */
export class AfiliacionFileParser {
  parse(buffer: Buffer, filename: string): AfiliacionEntity[] {
    const text = this.decode(buffer);
    const separator = this.detectSeparator(text, filename);
    const rows = this.parseDelimited(text, separator);

    if (rows.length === 0) return [];

    const header = rows[0].map(h => h.trim());
    const data = rows.slice(1).filter(r => r.some(v => v.trim() !== ''));

    const { canonicalIndex, extrasIndex } = this.mapHeader(header);

    return data.map(row => this.buildEntity(row, canonicalIndex, extrasIndex, header));
  }

  private decode(buffer: Buffer): string {
    // Try UTF-8 first; fall back to Latin-1 if replacement chars appear.
    const utf8 = buffer.toString('utf-8');
    if (!utf8.includes('\uFFFD')) return utf8;
    return buffer.toString('latin1');
  }

  private detectSeparator(text: string, filename: string): string {
    const sample = text.split(/\r?\n/, 3).join('\n');
    // If user file has .txt extension and contains pipes, prefer pipes.
    if (/\|/.test(sample) && /\.txt$/i.test(filename)) return '|';
    const commas = (sample.match(/,/g) || []).length;
    const semis = (sample.match(/;/g) || []).length;
    const pipes = (sample.match(/\|/g) || []).length;
    const max = Math.max(commas, semis, pipes);
    if (max === 0) return ','; // degenerate single-column file
    if (max === pipes) return '|';
    if (max === semis) return ';';
    return ',';
  }

  private parseDelimited(text: string, separator: string): string[][] {
    const rows: string[][] = [];
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      if (line.trim() === '') continue;
      rows.push(this.splitCsvLine(line, separator));
    }
    return rows;
  }

  /**
   * Minimal CSV line splitter supporting double-quoted fields and escaped
   * inner quotes (`""`). Good enough for Toad / SQL Developer exports.
   */
  private splitCsvLine(line: string, sep: string): string[] {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') {
            cur += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          cur += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === sep) {
          out.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      }
    }
    out.push(cur);
    return out.map(s => s.trim());
  }

  private mapHeader(header: string[]): {
    canonicalIndex: Record<string, number>;
    extrasIndex: number[];
  } {
    const canonicalIndex: Record<string, number> = {};
    const takenIdx = new Set<number>();

    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      for (let i = 0; i < header.length; i++) {
        if (takenIdx.has(i)) continue;
        const norm = normalize(header[i]);
        if (aliases.some(a => normalize(a) === norm)) {
          canonicalIndex[field] = i;
          takenIdx.add(i);
          break;
        }
      }
    }

    const extrasIndex: number[] = [];
    for (let i = 0; i < header.length; i++) {
      if (!takenIdx.has(i)) extrasIndex.push(i);
    }
    return { canonicalIndex, extrasIndex };
  }

  private buildEntity(
    row: string[],
    canonicalIndex: Record<string, number>,
    extrasIndex: number[],
    header: string[],
  ): AfiliacionEntity {
    const get = (field: string): string | undefined => {
      const idx = canonicalIndex[field];
      if (idx === undefined) return undefined;
      const val = row[idx];
      return val !== undefined && val.trim() !== '' ? val : undefined;
    };

    const idAfiliacion = get('idAfiliacion') ?? '';

    const extras: Record<string, string> = {};
    for (const i of extrasIndex) {
      const key = header[i] ?? `col_${i}`;
      const val = row[i];
      if (val !== undefined && val.trim() !== '') extras[key] = val;
    }

    return new AfiliacionEntity(
      idAfiliacion,
      get('nombreComercio'),
      get('razonSocial'),
      get('rfc'),
      get('numeroCliente'),
      get('giro'),
      get('mccDescripcion'),
      get('esquema'),
      get('tipoIntegracion'),
      get('direccion'),
      get('ciudad'),
      get('estado'),
      get('codigoPostal'),
      get('email'),
      get('telefono'),
      get('usuario'),
      get('status'),
      Object.keys(extras).length > 0 ? extras : undefined,
    );
  }
}
