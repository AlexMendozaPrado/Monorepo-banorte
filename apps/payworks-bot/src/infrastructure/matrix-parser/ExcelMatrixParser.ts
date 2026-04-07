import * as XLSX from 'xlsx';
import { MatrixParserPort, MatrixTransaction } from '@/core/domain/ports/MatrixParserPort';
import { TransactionType } from '@/core/domain/value-objects/TransactionType';
import { TransactionTypeValueObject } from '@/core/domain/value-objects/TransactionType';
import { CardBrand } from '@/core/domain/value-objects/CardBrand';
import { CardBrandValueObject } from '@/core/domain/value-objects/CardBrand';

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
  };

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

    return {
      referencia,
      numeroControl,
      tipoTransaccion,
      cardBrand,
      monto,
      fecha,
      hora,
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
