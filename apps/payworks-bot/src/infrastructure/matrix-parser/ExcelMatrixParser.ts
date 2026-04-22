import * as XLSX from 'xlsx';
import { MatrixParserPort, MatrixTransaction } from '@/core/domain/ports/MatrixParserPort';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';
import { TransactionTypeValueObject } from '@/core/domain/value-objects/TransactionType';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { CardBrandValueObject } from '@/core/domain/value-objects/CardBrand';
import { An5822Flow } from '@/core/domain/value-objects/An5822Flow';

/**
 * Parser de Matriz de Pruebas Excel
 * Extrae las transacciones que el comercio ejecuto y registro en la matriz
 */
export class ExcelMatrixParser implements MatrixParserPort {
  private static readonly COLUMN_MAPPINGS: Record<string, string> = {
    'REFERENCIA': 'referencia',
    'NUMERO_CONTROL': 'numeroControl',
    'NUMERO CONTROL': 'numeroControl',
    'CONTROL_NUMBER': 'numeroControl',
    'TIPO_TRANSACCION': 'tipoTransaccion',
    'TIPO TRANSACCION': 'tipoTransaccion',
    'TIPO_TRANS': 'tipoTransaccion',
    'CMD_TRANS': 'tipoTransaccion',
    'TARJETA': 'cardBrand',
    'MARCA': 'cardBrand',
    'CARD_BRAND': 'cardBrand',
    'MONTO': 'monto',
    'AMOUNT': 'monto',
    'FECHA': 'fecha',
    'DATE': 'fecha',
    'HORA': 'hora',
    'TIME': 'hora',
    'FLUJO_AN5822': 'flujoAn5822',
    'FLUJO AN5822': 'flujoAn5822',
    'FLUJOAN5822': 'flujoAn5822',
    'AN5822_FLOW': 'flujoAn5822',
    'AN5822 FLOW': 'flujoAn5822',
  };

  /**
   * Normalización tolerante del valor declarado en la columna
   * `flujo_an5822`. Acepta las 4 formas canónicas del enum (sensibles a
   * caja) más variantes típicas de escritura humana (todo minúsculas,
   * todo mayúsculas, con o sin underscores).
   *
   * Retorna:
   *   - `undefined` si la columna NO existía en la matriz (caller: la
   *     entrada `raw` vino sin definir).
   *   - `null` si la columna estaba presente pero vacía o con `N/A`.
   *   - un `An5822Flow` concreto si el valor es válido.
   *   - lanza `Error` para valores no reconocidos (caller debe propagar).
   */
  private static parseFlujoAn5822(raw: string | undefined, rowIndex: number): An5822Flow | null | undefined {
    if (raw === undefined) return undefined;
    const trimmed = raw.trim();
    if (trimmed === '' || trimmed.toUpperCase() === 'N/A') return null;

    const normalized = trimmed.toLowerCase();
    const map: Record<string, An5822Flow> = {
      'firstcit': An5822Flow.FIRST_CIT,
      'first_cit': An5822Flow.FIRST_CIT,
      'subseqcit': An5822Flow.SUBSEQ_CIT,
      'subseq_cit': An5822Flow.SUBSEQ_CIT,
      'subseqmit': An5822Flow.SUBSEQ_MIT,
      'subseq_mit': An5822Flow.SUBSEQ_MIT,
    };
    const flow = map[normalized];
    if (!flow) {
      throw new Error(
        `Fila ${rowIndex + 2}: valor inválido en columna flujo_an5822: '${raw}'. ` +
        'Valores permitidos: firstCIT, subseqCIT, subseqMIT, N/A o vacío.',
      );
    }
    return flow;
  }

  async parse(buffer: Buffer): Promise<MatrixTransaction[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

    if (rows.length === 0) {
      throw new Error('La Matriz de Pruebas esta vacia');
    }

    return rows.map((row, index) => this.parseRow(row, index));
  }

  private parseRow(row: Record<string, string>, index: number): MatrixTransaction {
    const mapped = this.mapColumns(row);

    const referencia = mapped['referencia'];
    if (!referencia) {
      throw new Error(`Fila ${index + 2}: REFERENCIA es requerida`);
    }

    const numeroControl = mapped['numeroControl'] || '';
    const monto = parseFloat(mapped['monto'] || '0');
    const fecha = mapped['fecha'] || '';
    const hora = mapped['hora'] || '';

    let tipoTransaccion: TransactionType;
    try {
      tipoTransaccion = TransactionTypeValueObject.fromCmdTrans(
        mapped['tipoTransaccion'] || 'AUTH'
      ).getValue();
    } catch {
      tipoTransaccion = TransactionType.AUTH;
    }

    let cardBrand: CardBrand;
    try {
      cardBrand = CardBrandValueObject.fromString(
        mapped['cardBrand'] || 'VISA'
      ).getValue();
    } catch {
      cardBrand = CardBrand.VISA;
    }

    const flujoAn5822 = ExcelMatrixParser.parseFlujoAn5822(mapped['flujoAn5822'], index);

    return {
      referencia,
      numeroControl,
      tipoTransaccion,
      cardBrand,
      monto,
      fecha,
      hora,
      ...(flujoAn5822 !== undefined ? { flujoAn5822 } : {}),
    };
  }

  private mapColumns(row: Record<string, string>): Record<string, string> {
    const mapped: Record<string, string> = {};

    for (const [originalKey, value] of Object.entries(row)) {
      const normalizedKey = originalKey.toUpperCase().trim();
      const mappedKey = ExcelMatrixParser.COLUMN_MAPPINGS[normalizedKey];
      if (mappedKey) {
        mapped[mappedKey] = String(value).trim();
      }
    }

    return mapped;
  }
}
